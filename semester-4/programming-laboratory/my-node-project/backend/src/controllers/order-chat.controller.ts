import { ChatSenderRole } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { OrderChatEventsService } from "../services/order-chat-events.service";

const getOrderId = (value: string): number | null => {
  const orderId = Number(value);
  return Number.isInteger(orderId) && orderId > 0 ? orderId : null;
};

export const OrderChatController = {
  async list(req: Request, res: Response) {
    const orderId = getOrderId(req.params.id);
    if (orderId === null) return res.status(400).json({ error: "Identificador do pedido inválido." });

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      const messages = await prisma.orderChatMessage.findMany({
        where: { orderId },
        orderBy: { createdAt: "asc" },
      });
      return res.json(messages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ error: "Erro ao carregar mensagens do pedido.", details: message });
    }
  },

  async send(req: Request, res: Response) {
    const orderId = getOrderId(req.params.id);
    if (orderId === null) return res.status(400).json({ error: "Identificador do pedido inválido." });

    const { senderRole, senderName, message } = req.body;
    if (!Object.values(ChatSenderRole).includes(senderRole)) {
      return res.status(400).json({ error: "Remetente da mensagem inválido." });
    }
    if (typeof senderName !== "string" || !senderName.trim() || senderName.trim().length > 80) {
      return res.status(400).json({ error: "Informe um nome válido para o remetente." });
    }
    if (typeof message !== "string" || !message.trim() || message.trim().length > 1000) {
      return res.status(400).json({ error: "A mensagem deve ter entre 1 e 1000 caracteres." });
    }

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      const createdMessage = await prisma.orderChatMessage.create({
        data: {
          orderId,
          senderRole,
          senderName: senderName.trim(),
          message: message.trim(),
        },
      });
      OrderChatEventsService.broadcast(orderId, createdMessage);
      return res.status(201).json(createdMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ error: "Erro ao enviar mensagem.", details: message });
    }
  },

  async stream(req: Request, res: Response) {
    const orderId = getOrderId(req.params.id);
    if (orderId === null) return res.status(400).json({ error: "Identificador do pedido inválido." });

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
      OrderChatEventsService.addClient(orderId, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      return res.status(500).json({ error: "Erro ao conectar ao chat.", details: message });
    }
  },
};
