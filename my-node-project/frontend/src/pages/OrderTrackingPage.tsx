import React, { useState } from 'react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

/**
 * TELA 3: Comanda Digital / Acompanhamento do Pedido
 * ----------------------------------------------------
 * Objetivo: Permitir que o cliente acompanhe seu pedido na mesa em tempo real.
 * Funcionalidades:
 * - Linha do tempo visual do status: RECEBIDO -> EM PREPARO -> PRONTO -> ENTREGUE
 * - Extrato detalhado com os pratos pedidos, adicionais e valor total
 * - Busca de comanda por código ou ID
 */
export const OrderTrackingPage: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState<string>('1');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderIdInput) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrderById(Number(orderIdInput));
      setOrder(data);
    } catch (err: any) {
      setError('Comanda não encontrada. Verifique o número digitado.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'RECEIVED', label: 'Recebido', icon: '📥' },
    { status: 'PREPARING', label: 'Na Cozinha', icon: '🍳' },
    { status: 'READY', label: 'Pronto p/ Entrega', icon: '🔔' },
    { status: 'DELIVERED', label: 'Entregue na Mesa', icon: '✅' },
  ];

  const getStepIndex = (status?: OrderStatus): number => {
    if (!status) return -1;
    switch (status) {
      case 'RECEIVED':
        return 0;
      case 'PREPARING':
        return 1;
      case 'READY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order?.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>📋</span> Comanda Digital do Cliente
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Acompanhe o status do seu pedido e o extrato da mesa em tempo real
        </p>

        {/* Input de Busca */}
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Digite o ID da Comanda (ex: 1)"
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={fetchOrder}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Buscar Comanda
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-slate-400 text-sm">Buscando comanda...</div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Identificação da Comanda */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">
                Comanda Ativa
              </span>
              <h3 className="text-2xl font-black text-slate-900">{order.code}</h3>
              <p className="text-xs text-slate-500">
                {order.customerName ? `Cliente: ${order.customerName}` : 'Cliente não informado'} •{' '}
                {order.tableId ? `Mesa ${order.table?.number || order.tableId}` : 'Balcão'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total da Comanda</span>
              <p className="text-2xl font-black text-slate-900">
                R$ {order.totalAmount.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Linha do Tempo Visual (Timeline) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Progresso do Pedido
            </h4>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {steps.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={step.status} className="text-center space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`text-lg p-2 rounded-xl border mx-auto w-10 h-10 flex items-center justify-center ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-50 shadow-xs'
                          : isPassed
                          ? 'border-amber-300 bg-amber-50/50 text-slate-700'
                          : 'border-slate-200 bg-slate-50 text-slate-300'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`text-[11px] font-semibold ${
                        isCurrent ? 'text-amber-700 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extrato dos Itens Pedidos */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Itens da Comanda
            </h4>
            <div className="divide-y divide-slate-100 text-sm">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-slate-800">
                      {item.quantity}x {item.menuItem?.name || `Item #${item.menuItemId}`}
                    </span>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {item.selectedOptions.map((o) => `+ ${o.name} (R$ ${o.price.toFixed(2)})`).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-amber-700 font-medium mt-0.5">Obs: {item.notes}</p>
                    )}
                  </div>
                  <span className="font-bold text-slate-800">
                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

