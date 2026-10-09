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
};
