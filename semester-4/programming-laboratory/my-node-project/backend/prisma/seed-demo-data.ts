import "dotenv/config";
import { OrderStatus, OrderType, PrismaClient, TableStatus } from "@prisma/client";

const prisma = new PrismaClient();

const demoOrders = [
  {
    code: "#TESTE-501",
    customerName: "Lucas Silva (teste)",
    status: OrderStatus.RECEIVED,
    tableCapacity: 2,
    items: [
      { name: "Classic Cheeseburger", quantity: 1, notes: "Sem picles" },
      { name: "Coca-Cola Lata 350ml", quantity: 1 },
    ],
  },
  {
    code: "#TESTE-502",
    customerName: "Mariana Costa (teste)",
    status: OrderStatus.PREPARING,
    tableCapacity: 4,
    items: [
      { name: "Smoky Bacon & Barbecue", quantity: 1 },
      { name: "Batatas Rústicas com Alecrim", quantity: 1 },
    ],
  },
  {
    code: "#TESTE-503",
    customerName: "Pedro Alves (teste)",
    status: OrderStatus.READY,
    tableCapacity: 2,
    items: [
      { name: "Brownie com Sorvete de Baunilha", quantity: 1 },
      { name: "Suco Natural de Laranja 500ml", quantity: 1 },
    ],
  },
] as const;

async function main() {
  const productNames = [...new Set(demoOrders.flatMap((order) => order.items.map((item) => item.name)))];

  await prisma.$transaction(async (transaction) => {
    const menuItems = await transaction.menuItem.findMany({
      where: { name: { in: productNames } },
      include: { optionGroups: { include: { options: true } } },
    });
    const menuItemsByName = new Map(menuItems.map((item) => [item.name, item]));
    const missingNames = productNames.filter((name) => !menuItemsByName.has(name));

    if (missingNames.length > 0) {
      throw new Error(
        `Não foi possível carregar os dados de demonstração. Itens ausentes no cardápio: ${missingNames.join(", ")}. Execute primeiro o seed principal em um banco de demonstração.`
      );
    }

    const existingOrders = await transaction.order.findMany({
      where: { code: { in: demoOrders.map((order) => order.code) } },
      select: { code: true, tableId: true },
    });
    const existingOrdersByCode = new Map(existingOrders.map((order) => [order.code, order]));
    const highestTable = await transaction.table.aggregate({ _max: { number: true } });
    let nextTableNumber = highestTable._max.number ?? 0;
    let createdTables = 0;
    let createdOrders = 0;

    for (const demoOrder of demoOrders) {
      const existingOrder = existingOrdersByCode.get(demoOrder.code);
      let table = existingOrder?.tableId
        ? await transaction.table.findUnique({ where: { id: existingOrder.tableId } })
        : null;

      if (!table) {
        nextTableNumber += 1;
        table = await transaction.table.create({
          data: {
            number: nextTableNumber,
            capacity: demoOrder.tableCapacity,
            status: TableStatus.OCCUPIED,
          },
        });
        createdTables += 1;
      }

      if (existingOrder) {
        if (existingOrder.tableId === null) {
          await transaction.order.update({
            where: { code: demoOrder.code },
            data: { tableId: table.id },
          });
        }
        continue;
      }

      let totalAmount = 0;
      const orderItems = demoOrder.items.map((requestedItem) => {
        const menuItem = menuItemsByName.get(requestedItem.name);
        if (!menuItem) {
          throw new Error(`Item ausente no cardápio: ${requestedItem.name}.`);
        }

        const selectedOptions = menuItem.optionGroups
          .filter((group) => group.isRequired)
          .flatMap((group) => {
            const selectionCount = Math.max(group.minSelect, 1);
            if (group.options.length < selectionCount) {
              throw new Error(`O grupo "${group.title}" de "${menuItem.name}" não tem opções suficientes.`);
            }
            return group.options.slice(0, selectionCount);
          });
        const unitPrice =
          menuItem.price + selectedOptions.reduce((sum, option) => sum + option.additionalPrice, 0);
        const subtotal = unitPrice * requestedItem.quantity;
        totalAmount += subtotal;

        return {
          menuItemId: menuItem.id,
          quantity: requestedItem.quantity,
          unitPrice,
          subtotal,
          notes: "notes" in requestedItem ? requestedItem.notes : null,
          selectedOptions: {
            create: selectedOptions.map((option) => ({
              optionItemId: option.id,
              name: option.name,
              price: option.additionalPrice,
            })),
          },
        };
      });

      await transaction.order.create({
        data: {
          code: demoOrder.code,
          type: OrderType.DINE_IN,
          status: demoOrder.status,
          tableId: table.id,
          customerName: demoOrder.customerName,
          totalAmount: Number(totalAmount.toFixed(2)),
          items: { create: orderItems },
        },
      });
      createdOrders += 1;
    }

    console.log(
      `Dados de demonstração prontos: ${createdTables} mesa(s) e ${createdOrders} pedido(s) adicionados. Registros existentes foram preservados.`
    );
  });
}

main()
  .catch((error) => {
    console.error("Erro ao inserir dados de demonstração:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
