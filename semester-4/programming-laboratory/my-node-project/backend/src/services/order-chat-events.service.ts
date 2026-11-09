import { Response } from "express";
import type { OrderChatMessage } from "@prisma/client";

export class OrderChatEventsService {
  private static clients = new Map<number, Set<Response>>();

  static addClient(orderId: number, res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const orderClients = this.clients.get(orderId) ?? new Set<Response>();
    orderClients.add(res);
    this.clients.set(orderId, orderClients);
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ orderId })}\n\n`);

    res.on("close", () => {
      orderClients.delete(res);
      if (orderClients.size === 0) this.clients.delete(orderId);
    });
  }

  static broadcast(orderId: number, message: OrderChatMessage): void {
    const listeners = this.clients.get(orderId);
    if (!listeners) return;
    const event = `event: CHAT_MESSAGE_CREATED\ndata: ${JSON.stringify(message)}\n\n`;
    for (const client of listeners) client.write(event);
  }
}
