import { PrismaClient, OrderStatus, OrderType, TableStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar tabelas existentes (ordem correta para respeitar FK)
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.optionItem.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  // 1. Criar Mesas
  console.log("🪑 Criando mesas...");
  const tables = await Promise.all([
    prisma.table.create({ data: { number: 1, capacity: 2, status: TableStatus.OCCUPIED } }),
    prisma.table.create({ data: { number: 2, capacity: 4, status: TableStatus.OCCUPIED } }),
    prisma.table.create({ data: { number: 3, capacity: 4, status: TableStatus.OCCUPIED } }),
    prisma.table.create({ data: { number: 4, capacity: 6, status: TableStatus.AVAILABLE } }),
    prisma.table.create({ data: { number: 5, capacity: 4, status: TableStatus.AVAILABLE } }),
    prisma.table.create({ data: { number: 6, capacity: 8, status: TableStatus.AVAILABLE } }),
  ]);

  // 2. Criar Categorias
  console.log("📂 Criando categorias...");
  const catPetiscos = await prisma.category.create({
    data: { name: "Entradas & Petiscos", description: "Perfeitos para compartilhar", icon: "🍟", orderIndex: 1 },
  });

  const catBurgers = await prisma.category.create({
    data: { name: "Hambúrgueres Artesanais", description: "Feitos na brasa com blend especial de 180g", icon: "🍔", orderIndex: 2 },
  });

  const catBebidas = await prisma.category.create({
    data: { name: "Bebidas", description: "Sucos naturais, refrigerantes e cervejas artesanais", icon: "🥤", orderIndex: 3 },
  });

  const catSobremesas = await prisma.category.create({
    data: { name: "Sobremesas", description: "Finalize sua experiência com uma sobremesa deliciosa", icon: "🍰", orderIndex: 4 },
  });

  // 3. Criar Itens do Cardápio com Grupos de Opções
  console.log("🍔 Criando itens do cardápio e opcionais...");

  // Hambúrguer Clássico
  const burgerClassico = await prisma.menuItem.create({
    data: {
      categoryId: catBurgers.id,
      name: "Classic Cheeseburger",
      description: "Pão brioche tostado na manteiga, blend 180g, queijo cheddar derretido e maionese defumada da casa.",
      price: 34.9,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      optionGroups: {
        create: [
          {
            title: "Ponto da Carne",
            isRequired: true,
            minSelect: 1,
            maxSelect: 1,
            options: {
              create: [
                { name: "Mal Passado", additionalPrice: 0 },
                { name: "Ao Ponto (Recomendado)", additionalPrice: 0 },
                { name: "Bem Passado", additionalPrice: 0 },
              ],
            },
          },
          {
            title: "Adicionais Extras",
            isRequired: false,
            minSelect: 0,
            maxSelect: 3,
            options: {
              create: [
                { name: "Bacon Crocante em Fatias", additionalPrice: 5.0 },
                { name: "Cebola Caramelizada", additionalPrice: 3.5 },
                { name: "Queijo Cheddar Extra", additionalPrice: 4.0 },
              ],
            },
          },
        ],
      },
    },
    include: { optionGroups: { include: { options: true } } },
  });

  // Hambúrguer Bacon BBQ
  const burgerBacon = await prisma.menuItem.create({
    data: {
      categoryId: catBurgers.id,
      name: "Smoky Bacon & Barbecue",
      description: "Blend 180g, fatias generosas de bacon, cebola crispy crocante e molho barbecue artesanal.",
      price: 39.9,
      imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80",
      optionGroups: {
        create: [
          {
            title: "Ponto da Carne",
            isRequired: true,
            minSelect: 1,
            maxSelect: 1,
            options: {
              create: [
                { name: "Ao Ponto", additionalPrice: 0 },
                { name: "Bem Passado", additionalPrice: 0 },
              ],
            },
          },
        ],
      },
    },
    include: { optionGroups: { include: { options: true } } },
  });

  // Batata Frita
  const batataFrita = await prisma.menuItem.create({
    data: {
      categoryId: catPetiscos.id,
      name: "Batatas Rústicas com Alecrim",
      description: "Batatas cortadas à mão, temperadas com sal marinho, alecrim fresco e alho assado.",
      price: 22.0,
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
      optionGroups: {
        create: [
          {
            title: "Molho de Acompanhamento",
            isRequired: true,
            minSelect: 1,
            maxSelect: 2,
            options: {
              create: [
                { name: "Maionese Verde da Casa", additionalPrice: 0 },
                { name: "Molho Barbecue", additionalPrice: 0 },
                { name: "Geléia de Pimenta", additionalPrice: 3.0 },
              ],
            },
          },
        ],
      },
    },
    include: { optionGroups: { include: { options: true } } },
  });

  // Bebidas
  const refrigerante = await prisma.menuItem.create({
    data: {
      categoryId: catBebidas.id,
      name: "Coca-Cola Lata 350ml",
      description: "Refrigerante gelado servido com copo e gelo opcional.",
      price: 7.5,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    },
  });

  const sucoNatural = await prisma.menuItem.create({
    data: {
      categoryId: catBebidas.id,
      name: "Suco Natural de Laranja 500ml",
      description: "Suco 100% natural espremido na hora.",
      price: 11.0,
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
      optionGroups: {
        create: [
          {
            title: "Adoçar",
            isRequired: true,
            minSelect: 1,
            maxSelect: 1,
            options: {
              create: [
                { name: "Sem Açúcar", additionalPrice: 0 },
                { name: "Com Açúcar", additionalPrice: 0 },
                { name: "Com Adoçante", additionalPrice: 0 },
              ],
            },
          },
        ],
      },
    },
    include: { optionGroups: { include: { options: true } } },
  });

  // Sobremesa
  const brownie = await prisma.menuItem.create({
    data: {
      categoryId: catSobremesas.id,
      name: "Brownie com Sorvete de Baunilha",
      description: "Brownie quentinho de chocolate belga 70% com bola de sorvete de baunilha e calda de fudge.",
      price: 24.5,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    },
  });

  // 4. Criar Pedidos Iniciais para alimentar o painel KDS e Mesas
  console.log("📋 Criando pedidos de exemplo para a máquina de estados...");

  // Pedido 1: RECEIVED (Recebido - aguardando início do preparo na cozinha)
  const pontoCarneOpt = burgerClassico.optionGroups[0].options[1]; // Ao ponto
  const baconOpt = burgerClassico.optionGroups[1].options[0]; // Bacon

  await prisma.order.create({
    data: {
      code: "#PED-101",
      type: OrderType.DINE_IN,
      status: OrderStatus.RECEIVED,
      tableId: tables[0].id, // Mesa 1
      customerName: "Lucas Silva",
      notes: "Caprichar no molho por favor!",
      totalAmount: 39.9 + 7.5,
      items: {
        create: [
          {
            menuItemId: burgerClassico.id,
            quantity: 1,
            unitPrice: 39.9,
            subtotal: 39.9,
            notes: "Sem picles se tiver",
            selectedOptions: {
              create: [
                { optionItemId: pontoCarneOpt.id, name: pontoCarneOpt.name, price: pontoCarneOpt.additionalPrice },
                { optionItemId: baconOpt.id, name: baconOpt.name, price: baconOpt.additionalPrice },
              ],
            },
          },
          {
            menuItemId: refrigerante.id,
            quantity: 1,
            unitPrice: 7.5,
            subtotal: 7.5,
          },
        ],
      },
    },
  });

  // Pedido 2: PREPARING (Em Preparo na Cozinha)
  const molhoOpt = batataFrita.optionGroups[0].options[0]; // Maionese Verde
  await prisma.order.create({
    data: {
      code: "#PED-102",
      type: OrderType.DINE_IN,
      status: OrderStatus.PREPARING,
      tableId: tables[1].id, // Mesa 2
      customerName: "Mariana Costa",
      totalAmount: 39.9 + 22.0,
      items: {
        create: [
          {
            menuItemId: burgerBacon.id,
            quantity: 1,
            unitPrice: 39.9,
            subtotal: 39.9,
          },
          {
            menuItemId: batataFrita.id,
            quantity: 1,
            unitPrice: 22.0,
            subtotal: 22.0,
            selectedOptions: {
              create: [
                { optionItemId: molhoOpt.id, name: molhoOpt.name, price: molhoOpt.additionalPrice },
              ],
            },
          },
        ],
      },
    },
  });

  // Pedido 3: READY (Pronto para Entrega pelo Garçom)
  await prisma.order.create({
    data: {
      code: "#PED-103",
      type: OrderType.DINE_IN,
      status: OrderStatus.READY,
      tableId: tables[2].id, // Mesa 3
      customerName: "Pedro Alves",
      totalAmount: 24.5,
      items: {
        create: [
          {
            menuItemId: brownie.id,
            quantity: 1,
            unitPrice: 24.5,
            subtotal: 24.5,
          },
        ],
      },
    },
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

