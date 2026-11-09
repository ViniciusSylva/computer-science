import { Request, Response } from "express";
import { prisma } from "../prisma";
import { OrderStatus, OrderType } from "@prisma/client";
import { OrderStateMachine } from "../services/order-state-machine";
import { OrderEventsService } from "../services/order-events.service";

export const OrderController = {
  /**
   * Listar pedidos com filtros (status, mesa, tipo)
   * Ideal para KDS (fila de pedidos) e acompanhamento
   */
  async list(req: Request, res: Response) {
    try {
      const { status, tableId, type } = req.query;

      const whereClause: any = {};
      if (status) {
        whereClause.status = status as OrderStatus;
      }
      if (tableId) {
        whereClause.tableId = Number(tableId);
      }
      if (type) {
        whereClause.type = type as OrderType;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" }, // Mais antigos primeiro (fila de produção)
        include: {
          table: true,
          items: {
            include: {
              menuItem: true,
              selectedOptions: true,
            },
          },
        },
      });

      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao listar pedidos", details: error.message });
    }
  },

  /**
   * Buscar pedido específico por ID (ou código)
   */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          table: true,
          items: {
            include: {
              menuItem: true,
              selectedOptions: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      return res.json(order);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao buscar pedido", details: error.message });
    }
  },

  /**
   * Criar novo pedido (Comanda Digital do Cliente ou Garçom)
   */
  async create(req: Request, res: Response) {
    try {
      const {
        type = "DINE_IN",
        tableId,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
      }

      if (type === "DINE_IN" && !tableId) {
        return res.status(400).json({ error: "Mesa é obrigatória para pedidos no salão." });
      }

      // Buscar os itens do banco para garantir integridade de preços
      const menuItemIds = items.map((i: any) => Number(i.menuItemId));
      const dbMenuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        include: {
          optionGroups: {
            include: {
              options: true,
            },
          },
        },
      });

      const menuMap = new Map(dbMenuItems.map((item) => [item.id, item]));

      let calculatedTotal = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
        const dbItem = menuMap.get(Number(item.menuItemId));
        if (!dbItem) {
          return res.status(400).json({ error: `Item com ID ${item.menuItemId} não existe.` });
        }
        if (!dbItem.isAvailable) {
          return res.status(400).json({ error: `Item "${dbItem.name}" não está disponível no momento.` });
        }

        const quantity = Number(item.quantity) || 1;
        let itemUnitTotal = dbItem.price;
        const selectedOptionsData: any[] = [];

        // Processar opções selecionadas
        if (item.selectedOptionIds && Array.isArray(item.selectedOptionIds)) {
          const allOptionsInItem = dbItem.optionGroups.flatMap((g) => g.options);
          const optionMap = new Map(allOptionsInItem.map((o) => [o.id, o]));

          for (const optId of item.selectedOptionIds) {
            const dbOption = optionMap.get(Number(optId));
            if (dbOption) {
              itemUnitTotal += dbOption.additionalPrice;
              selectedOptionsData.push({
                optionItemId: dbOption.id,
                name: dbOption.name,
                price: dbOption.additionalPrice,
              });
            }
          }
        }

        const subtotal = itemUnitTotal * quantity;
        calculatedTotal += subtotal;

        orderItemsData.push({
          menuItemId: dbItem.id,
          quantity,
          unitPrice: itemUnitTotal,
          subtotal,
          notes: item.notes || null,
          selectedOptions: {
            create: selectedOptionsData,
          },
        });
      }

      // Gerar código único amigável para o pedido (Ex: #PED-4821)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `#PED-${randomSuffix}`;

      const newOrder = await prisma.order.create({
          data: {
            code,
            type: type as OrderType,
            status: OrderStatus.RECEIVED,
            tableId: tableId ? Number(tableId) : null,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
            deliveryAddress: deliveryAddress || null,
            notes: notes || null,
            totalAmount: Number(calculatedTotal.toFixed(2)),
            items: {
              create: orderItemsData,
            },
          },
          include: {
            table: true,
            items: {
              include: {
                menuItem: true,
                selectedOptions: true,
              },
            },
          },
      });

      // Notificar clientes SSE conectados (KDS e Comanda) em tempo real
      OrderEventsService.broadcast("ORDER_CREATED", newOrder);

      return res.status(201).json(newOrder);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao criar pedido", details: error.message });
    }
  },

  /**
   * Atualizar status do pedido aplicando a Máquina de Estados:
   * RECEIVED -> PREPARING -> READY -> DELIVERED (ou CANCELED)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status: nextStatus } = req.body;

      if (!nextStatus || !Object.values(OrderStatus).includes(nextStatus)) {
        return res.status(400).json({ error: "Status fornecido é inválido." });
      }

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      // Validação da máquina de estados
      try {
        OrderStateMachine.validateTransition(order.status, nextStatus);
      } catch (validationError: any) {
        return res.status(400).json({ error: validationError.message });
      }

      const updatedOrder = await prisma.order.update({
          where: { id },
          data: { status: nextStatus },
          include: {
            table: true,
            items: {
              include: {
                menuItem: true,
                selectedOptions: true,
              },
            },
          },
      });

      // Notificar clientes SSE conectados (KDS e Comanda) sobre mudança de status
      OrderEventsService.broadcast("ORDER_UPDATED", updatedOrder);

      return res.json(updatedOrder);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao atualizar status do pedido", details: error.message });
    }
  },

  /**
   * Avançar status para a próxima etapa na esteira de produção (Atalho para o KDS)
   * RECEIVED -> PREPARING -> READY -> DELIVERED
   */
  async advanceStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      const nextStatus = OrderStateMachine.getNextStatus(order.status);
      if (!nextStatus) {
        return res.status(400).json({
          error: `O pedido já se encontra no status final "${order.status}" e não pode ser avançado.`,
        });
      }

      req.body.status = nextStatus;
      return OrderController.updateStatus(req, res);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao avançar pedido", details: error.message });
    }
  },

  /**
   * Retornar status para a etapa anterior (Desfazer avanço indevido)
   * DELIVERED -> READY -> PREPARING -> RECEIVED
   */
  async revertStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      const prevStatus = OrderStateMachine.getPreviousStatus(order.status);
      if (!prevStatus) {
        return res.status(400).json({
          error: `O pedido já se encontra no status inicial "${order.status}" e não pode ser retornado.`,
        });
      }

      req.body.status = prevStatus;
      return OrderController.updateStatus(req, res);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao retornar pedido", details: error.message });
    }
  },
};
