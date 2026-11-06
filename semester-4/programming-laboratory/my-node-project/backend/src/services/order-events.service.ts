import { Response } from "express";

export type OrderEventType = "ORDER_CREATED" | "ORDER_UPDATED";

export class OrderEventsService {
  private static clients: Set<Response> = new Set();

  /**
   * Registra um novo cliente para receber eventos SSE (KDS ou Comanda do Cliente)
   */
  static addClient(res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    this.clients.add(res);

    // Mensagem de boas-vindas / handshake inicial
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ message: "Conectado à fila em tempo real" })}\n\n`);

    res.on("close", () => {
      this.removeClient(res);
    });
  }

  /**
   * Remove o cliente desconectado
   */
  static removeClient(res: Response): void {
    this.clients.delete(res);
  }

  /**
   * Dispara atualização em tempo real para todos os clientes conectados
   */
  static broadcast(event: OrderEventType, payload: any): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(message);
    }
  }

  /**
   * Retorna a quantidade de ouvintes conectados
   */
  static getClientCount(): number {
    return this.clients.size;
  }
}

