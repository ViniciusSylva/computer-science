import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

/**
 * TELA 1: Painel KDS (Kitchen Display System)
 * ----------------------------------------------------
 * Objetivo: Gestão da fila de pedidos da cozinha em tempo real.
 * Funcionalidades:
 * - Colunas da máquina de estados: RECEIVED -> PREPARING -> READY -> DELIVERED
 * - Botão de 1 clique para avançar o pedido (api.advanceOrderStatus)
 * - Atualização instantânea conectando ao SSE (api.subscribeToOrderStream)
 */
export const KDSPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar pedidos iniciais
  useEffect(() => {
    loadOrders();

    // Conectar ao stream de eventos em tempo real (SSE)
    const eventSource = api.subscribeToOrderStream((payload) => {
      console.log('KDS: Novo evento SSE recebido:', payload);
      // Recarrega ou atualiza a fila ao receber novo pedido ou alteração de status
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

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((order) => order.status === status);

  const columns: { status: OrderStatus; label: string; icon: string; color: string; badge: string }[] = [
    { status: 'RECEIVED', label: 'Recebido', icon: '📥', color: 'border-amber-400 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
    { status: 'PREPARING', label: 'Em Preparo', icon: '🍳', color: 'border-blue-400 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
    { status: 'READY', label: 'Pronto', icon: '🔔', color: 'border-emerald-400 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
    { status: 'DELIVERED', label: 'Entregue', icon: '✅', color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-200 text-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>🍳</span> Painel KDS (Kitchen Display System)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fila de produção da cozinha conectada em tempo real via Server-Sent Events (SSE)
          </p>
        </div>
        <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium self-start sm:self-auto">
          ⚡ SSE Ativo: atualizações automáticas
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando fila da cozinha...</div>
      ) : (
        /* Colunas Kanban */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colOrders = getOrdersByStatus(col.status);
            return (
              <div key={col.status} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col min-h-[400px]">
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>{col.icon}</span> {col.label}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Lista de Pedidos */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-8 italic">Nenhum pedido nesta etapa</p>
                  ) : (
                    colOrders.map((order) => (
                      <div key={order.id} className={`border rounded-lg p-3 ${col.color} shadow-xs space-y-2`}>
                        <div className="flex justify-between items-start font-bold text-sm text-slate-800">
                          <span>{order.code}</span>
                          <span className="text-xs bg-white/90 px-2 py-0.5 rounded border text-slate-600">
                            {order.tableId ? `Mesa ${order.table?.number || order.tableId}` : 'Balcão'}
                          </span>
                        </div>

                        {/* Itens do Pedido */}
                        <div className="space-y-1 text-xs text-slate-700">
                          {order.items?.map((item) => (
                            <div key={item.id} className="border-b border-black/5 pb-1">
                              <span className="font-semibold">{item.quantity}x</span> {item.menuItem?.name || `Item #${item.menuItemId}`}
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <p className="text-[11px] text-slate-500 italic">
                                  + {item.selectedOptions.map((o) => o.name).join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-[11px] text-amber-700 font-medium">Obs: {item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Rodapé do Card com Ação de Avançar */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                            <button
                              onClick={() => handleAdvance(order.id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
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
    </div>
  );
};

