import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { KitchenChatWidget } from '../components/KitchenChatWidget';
import type { Order, OrderStatus } from '../types';

export const KDSPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);

  // Carregar pedidos iniciais
  useEffect(() => {
    loadOrders();

    const eventSource = api.subscribeToOrderStream(() => {
      loadOrders();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar pedidos no KDS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (orderId: number) => {
    try {
      await api.advanceOrderStatus(orderId);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Erro ao avançar pedido.');
    }
  };

  const handleRevert = async (orderId: number) => {
    try {
      await api.revertOrderStatus(orderId);
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Erro ao retornar pedido.');
    }
  };

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((order) => order.status === status);

  const columns: { status: OrderStatus; label: string; badgeColor: string }[] = [
    { status: 'RECEIVED', label: 'Recebido', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { status: 'PREPARING', label: 'Em Preparo', badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    { status: 'READY', label: 'Pronto', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { status: 'DELIVERED', label: 'Entregue', badgeColor: 'bg-slate-700/40 text-slate-400 border border-slate-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Simplificado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>🍳</span> Cozinha
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando fila...</div>
      ) : (
        /* Colunas Kanban harmonizadas em tons escuros */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colOrders = getOrdersByStatus(col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col min-h-[460px]"
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-300">
                    {col.label}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Lista de Pedidos */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-8 italic">Sem pedidos</p>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 shadow-sm space-y-2 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-start font-bold text-sm text-slate-100">
                          <span className="text-blue-400 font-mono">{order.code}</span>
                          <span className="text-xs bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded border border-slate-600">
                            {order.tableId ? `Mesa ${order.table?.number || order.tableId}` : 'Balcão'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setChatOrder(order)}
                          className="w-full rounded-md border border-slate-600 bg-slate-700/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:bg-blue-950/60 hover:text-blue-200"
                        >
                          💬 Conversar com cliente
                        </button>

                        {/* Itens do Pedido */}
                        <div className="space-y-1 text-xs text-slate-300">
                          {order.items?.map((item) => (
                            <div key={item.id} className="border-b border-slate-700/40 pb-1">
                              <span className="font-semibold text-white">{item.quantity}x</span>{' '}
                              {item.menuItem?.name || `Item #${item.menuItemId}`}
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <p className="text-[11px] text-slate-400 italic">
                                  + {item.selectedOptions.map((o) => o.name).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-[11px] text-amber-400 font-medium">Obs: {item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Rodapé do Card com Ações */}
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs gap-2">
                          {/* Botão de Retornar (se não estiver em Recebido) */}
                          {order.status !== 'RECEIVED' && order.status !== 'CANCELED' ? (
                            <button
                              onClick={() => handleRevert(order.id)}
                              className="text-slate-400 hover:text-amber-300 font-medium px-2 py-1 rounded text-xs bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Retornar para a etapa anterior"
                            >
                              &larr; Voltar
                            </button>
                          ) : (
                            <div />
                          )}

                          {/* Botão de Avançar */}
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                            <button
                              onClick={() => handleAdvance(order.id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ml-auto"
                            >
                              Avançar &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {chatOrder && (
        <KitchenChatWidget
          order={chatOrder}
          senderRole="KITCHEN"
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};
