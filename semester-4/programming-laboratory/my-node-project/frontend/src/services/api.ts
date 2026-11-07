import type { RegisterAccountRequest } from '../types';

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

  async getTables() {
    const res = await fetch(`${API_BASE_URL}/tables`);
    if (!res.ok) throw new Error('Falha ao carregar mesas');
    return res.json();
  },

  async getOrders(status?: string) {
    const url = status ? `${API_BASE_URL}/orders?status=${status}` : `${API_BASE_URL}/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    return res.json();
  },

  async getOrderById(orderId: number) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    if (!res.ok) throw new Error('Falha ao carregar pedido');
    return res.json();
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

  async createOrder(data: any) {
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
  subscribeToOrderStream(onMessage: (data: any) => void): EventSource {
    const eventSource = new EventSource(`${API_BASE_URL}/orders/stream`);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onMessage(payload);
      } catch (e) {
        console.error('Erro ao processar evento SSE:', e);
      }
    };
    return eventSource;
  },
};
