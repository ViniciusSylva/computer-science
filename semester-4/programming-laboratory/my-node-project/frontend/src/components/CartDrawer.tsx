import React from 'react';
import type { CartLine } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  items: CartLine[];
  isSubmitting: boolean;
  error: string;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tableNumber,
  items,
  isSubmitting,
  error,
  onQuantityChange,
  onRemove,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const total = items.reduce(
    (sum, line) =>
      sum +
      (line.item.price +
        line.selectedOptions.reduce((optionSum, option) => optionSum + option.additionalPrice, 0)) *
        line.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 id="cart-title" className="text-lg font-bold text-slate-100">Seu Pedido</h2>
            <p className="text-xs text-slate-400">Mesa {tableNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar pedido"
            className="text-lg font-bold text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Você ainda não adicionou itens ao pedido.
            </p>
          ) : (
            items.map((line) => {
              const unitPrice =
                line.item.price +
                line.selectedOptions.reduce((sum, option) => sum + option.additionalPrice, 0);
              return (
                <article key={line.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-100">{line.item.name}</h3>
                      {line.selectedOptions.length > 0 && (
                        <p className="mt-1 text-xs text-slate-400">
                          {line.selectedOptions.map((option) => option.name).join(', ')}
                        </p>
                      )}
                      {line.notes && <p className="mt-1 text-xs text-amber-300">{line.notes}</p>}
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-slate-200">
                      R$ {(unitPrice * line.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${line.item.name}`}
                        onClick={() => onQuantityChange(line.id, line.quantity - 1)}
                        className="h-7 w-7 rounded border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        −
                      </button>
                      <span className="min-w-5 text-center text-sm text-slate-100">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${line.item.name}`}
                        onClick={() => onQuantityChange(line.id, line.quantity + 1)}
                        className="h-7 w-7 rounded border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(line.id)}
                      className="text-xs font-medium text-rose-300 hover:text-rose-200"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="space-y-3 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between text-sm font-bold text-slate-200">
            <span>Total:</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || isSubmitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar e enviar para a cozinha'}
          </button>
        </div>
      </aside>
    </div>
  );
};
