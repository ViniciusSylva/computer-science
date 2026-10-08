import { OrderStatus } from "@prisma/client";

/**
 * Máquina de Estados de Pedidos
 * Fluxo padrão: RECEIVED -> PREPARING -> READY -> DELIVERED
 * Também permite cancelamento antes de DELIVERED.
 */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELED],
  READY: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
  DELIVERED: [], // Estado final
  CANCELED: [],  // Estado final
};

export class OrderStateMachine {
  /**
   * Verifica se a transição entre o status atual e o novo status é permitida
   */
  static canTransition(current: OrderStatus, next: OrderStatus): boolean {
    const allowed = ORDER_STATUS_FLOW[current] || [];
    return allowed.includes(next);
  }

  /**
   * Retorna o próximo passo natural no fluxo de produção
   */
  static getNextStatus(current: OrderStatus): OrderStatus | null {
    switch (current) {
      case OrderStatus.RECEIVED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  }

  /**
   * Valida a transição e lança erro amigável se inválida
   */
  static validateTransition(current: OrderStatus, next: OrderStatus): void {
    if (current === next) {
      throw new Error(`O pedido já está no status "${current}".`);
    }

    if (!this.canTransition(current, next)) {
      const allowed = ORDER_STATUS_FLOW[current].join(", ");
      throw new Error(
        `Transição inválida de "${current}" para "${next}". Transições permitidas a partir de "${current}": [${allowed || "Nenhuma - Estado Final"}].`
      );
    }
  }
}

