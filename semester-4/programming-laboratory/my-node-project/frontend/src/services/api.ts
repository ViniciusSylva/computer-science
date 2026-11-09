import type { Order, OrderChatMessage, RegisterAccountRequest, Table, TableStatus } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Falha ao carregar categorias');
    return res.json();
  },

  async getTables(): Promise<Table[]> {
    const res = await fetch(`${API_BASE_URL}/tables`);
    if (!res.ok) throw new Error('Falha ao carregar mesas');
    return res.json();
  },

  async createTable(data: { number: number; capacity: number }): Promise<Table> {
    const res = await fetch(`${API_BASE_URL}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível cadastrar a mesa.');
    }
    return res.json();
  },

  async deleteTable(tableId: number) {
    const res = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível remover a mesa.');
    }
  },

  async updateTable(tableId: number, data: { number?: number; capacity?: number; status?: TableStatus }): Promise<Table> {
    const res = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível atualizar a mesa.');
    }
    return res.json();
  },

  async getOrders(filters: { status?: string; tableId?: number } = {}): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filters.status) query.set('status', filters.status);
    if (filters.tableId !== undefined) query.set('tableId', String(filters.tableId));
    const queryString = query.toString();
    const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    return res.json();
  },

  async getOrderById(orderId: number): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!res.ok) throw new Error('Falha ao carregar pedido');
    return res.json();
  },

  async getOrderChatMessages(orderId: number): Promise<OrderChatMessage[]> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/messages`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível carregar as mensagens.');
    }
    return res.json();
  },

  async sendOrderChatMessage(
    orderId: number,
    data: { senderRole: OrderChatMessage['senderRole']; senderName: string; message: string }
  ): Promise<OrderChatMessage> {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível enviar a mensagem.');
    }
    return res.json();
  },

  subscribeToOrderChat(
    orderId: number,
    onMessage: (message: OrderChatMessage) => void
  ): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/orders/${orderId}/messages/stream`);
    eventSource.addEventListener('CHAT_MESSAGE_CREATED', (event: Event) => {
      try {
        const messageEvent = event as MessageEvent<string>;
        onMessage(JSON.parse(messageEvent.data) as OrderChatMessage);
      } catch (error) {
        console.error('Erro ao processar mensagem do chat:', error);
      }
    });
    return eventSource;
  },

  /**
   * Contrato esperado para a futura rota de cadastro de contas.
   * A confirmação da senha é validada na interface e não é enviada.
   */
  async registerAccount(data: RegisterAccountRequest): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.status === 404) {
      throw new Error(
        'O cadastro de contas ainda não está disponível: o backend não implementa POST /api/auth/register.'
      );
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Não foi possível cadastrar a conta.');
    }
  },

  async advanceOrderStatus(orderId: number) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/advance`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao avançar pedido');
    }
    return res.json();
  },

  async revertOrderStatus(orderId: number) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/revert`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao retornar pedido');
    }
    return res.json();
  },

  async updateOrderStatus(orderId: number, status: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar status');
    }
    return res.json();
  },

  async createOrder(data: {
    type: 'DINE_IN';
    tableId: number;
    items: { menuItemId: number; quantity: number; selectedOptionIds: number[]; notes?: string }[];
  }): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar pedido');
    }
    return res.json();
  },

  /**
   * Conecta ao stream SSE de eventos de pedidos em tempo real
   */
  subscribeToOrderStream(onMessage: (event: string, order: Order) => void): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/orders/stream`);
    const handleOrderEvent = (event: Event) => {
      try {
        const message = event as MessageEvent<string>;
        const order = JSON.parse(message.data) as Order;
        onMessage(message.type, order);
      } catch (e) {
        console.error('Erro ao processar evento SSE:', e);
      }
    };
    eventSource.addEventListener('ORDER_CREATED', handleOrderEvent);
    eventSource.addEventListener('ORDER_UPDATED', handleOrderEvent);
    return eventSource;
  },
};
