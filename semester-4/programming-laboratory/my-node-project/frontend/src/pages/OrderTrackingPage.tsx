import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { KitchenChatWidget } from '../components/KitchenChatWidget';
import type { Order, OrderStatus, Table } from '../types';

interface OrderTrackingPageProps {
  tableNumber?: number;
  initialOrder: Order | null;
}

const steps: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'RECEIVED', label: 'Recebido', icon: '📥' },
  { status: 'PREPARING', label: 'Na Cozinha', icon: '🍳' },
  { status: 'READY', label: 'Pronto p/ Entrega', icon: '🔔' },
  { status: 'DELIVERED', label: 'Entregue na Mesa', icon: '✅' },
];

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'RECEIVED': return 0;
    case 'PREPARING': return 1;
    case 'READY': return 2;
    case 'DELIVERED': return 3;
    default: return -1;
  }
};

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  tableNumber,
  initialOrder,
}) => {
  const [table, setTable] = useState<Table | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);
    setTable(null);
    setOrders([]);

    if (tableNumber === undefined) {
      setError('Não foi possível identificar esta mesa.');
      setLoading(false);
      return () => { isCurrent = false; };
    }

    const loadTableOrders = async () => {
      try {
        const tables = await api.getTables();
        const currentTable = tables.find((candidate) => candidate.number === tableNumber);
        if (!currentTable) {
          throw new Error(`A Mesa ${tableNumber} não está cadastrada neste restaurante.`);
        }
        const tableOrders = await api.getOrders({ tableId: currentTable.id });
        if (!isCurrent) return;
        setTable(currentTable);
        setOrders(
          initialOrder?.tableId === currentTable.id &&
            !tableOrders.some((order) => order.id === initialOrder.id)
            ? [initialOrder, ...tableOrders]
            : tableOrders
        );
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os pedidos desta mesa.');
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadTableOrders();
    return () => { isCurrent = false; };
  }, [tableNumber]);

  useEffect(() => {
    if (!table) return;
    const eventSource = api.subscribeToOrderStream((eventName, changedOrder) => {
      if (changedOrder.tableId !== table.id) return;
      if (eventName === 'ORDER_CREATED' || eventName === 'ORDER_UPDATED') {
        setOrders((current) => {
          const exists = current.some((order) => order.id === changedOrder.id);
          return exists
            ? current.map((order) => order.id === changedOrder.id ? changedOrder : order)
            : [changedOrder, ...current];
        });
      }
    });
    return () => eventSource.close();
  }, [table]);

  useEffect(() => {
    if (!initialOrder || initialOrder.tableId !== table?.id) return;
    setOrders((current) => current.some((order) => order.id === initialOrder.id)
      ? current.map((order) => order.id === initialOrder.id ? initialOrder : order)
      : [initialOrder, ...current]);
  }, [initialOrder, table?.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <span>📋</span> Meus Pedidos
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {table ? `Pedidos da Mesa ${table.number}. Os status são atualizados pela cozinha.` : 'Pedidos vinculados a esta mesa.'}
        </p>
      </div>

      {loading && <div className="py-8 text-center text-sm text-slate-500">Carregando pedidos...</div>}
      {error && (
        <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/60 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
          Ainda não há pedidos para esta mesa.
        </div>
      )}

      {orders.map((order) => {
        const currentStep = getStepIndex(order.status);
        return (
          <article key={order.id} className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-md">
            {order.status === 'CANCELED' && (
              <div role="status" className="rounded-lg border border-rose-800 bg-rose-950/60 p-3 text-sm text-rose-300">
                Este pedido foi cancelado pela cozinha.
              </div>
            )}

            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {order.status === 'DELIVERED' || order.status === 'CANCELED' ? 'Pedido finalizado' : 'Pedido em andamento'}
                </span>
                <h3 className="text-2xl font-black text-white">{order.code}</h3>
                <p className="text-xs text-slate-400">Mesa {table?.number ?? tableNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total</span>
                <p className="font-mono text-2xl font-black text-emerald-400">
                  R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChatOrder(order)}
              className="rounded-lg border border-blue-700/60 bg-blue-950/50 px-3 py-2 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-900/60"
            >
              💬 Conversar com a cozinha
            </button>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status do Pedido</h4>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {steps.map((step, index) => {
                  const isPassed = currentStep >= index;
                  const isCurrent = currentStep === index;
                  return (
                    <div key={step.status} className="space-y-1 text-center">
                      <div className={`h-2 rounded-full ${isPassed ? 'bg-blue-600' : 'bg-slate-800'}`} />
                      <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border p-2 text-lg ${
                        isCurrent ? 'border-blue-500 bg-blue-950/60 text-white'
                          : isPassed ? 'border-slate-700 bg-slate-800 text-slate-300'
                            : 'border-slate-800 bg-slate-900 text-slate-600'
                      }`}>
                        {step.icon}
                      </div>
                      <p className={`text-[11px] font-semibold ${
                        isCurrent ? 'font-bold text-blue-400' : isPassed ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Itens do Pedido</h4>
              <div className="divide-y divide-slate-800 text-sm">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-2.5">
                    <div>
                      <span className="font-semibold text-white">
                        {item.quantity}x {item.menuItem?.name || `Item #${item.menuItemId}`}
                      </span>
                      {item.selectedOptions?.length ? (
                        <p className="mt-0.5 text-xs italic text-slate-400">
                          {item.selectedOptions.map((option) => `+ ${option.name} (R$ ${option.price.toFixed(2)})`).join(', ')}
                        </p>
                      ) : null}
                      {item.notes && <p className="mt-0.5 text-xs font-medium text-amber-400">Obs: {item.notes}</p>}
                    </div>
                    <span className="whitespace-nowrap font-mono font-bold text-white">
                      R$ {item.subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
      {chatOrder && (
        <KitchenChatWidget
          order={chatOrder}
          senderRole="TABLE_CUSTOMER"
          tableNumber={table?.number ?? tableNumber}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};
