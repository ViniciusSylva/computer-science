import React from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  onCheckout: () => void;
}

/**
 * COMPONENTE: Carrinho de Compras (Drawer Lateral)
 * ----------------------------------------------------
 * Objetivo: Resumo dos itens selecionados e envio da comanda para a cozinha.
 * Ponto de extensão para o próximo chat:
 * - Listar os itens adicionados com suas opções e quantidades.
 * - Disparar a chamada `api.createOrder({ type: 'DINE_IN', tableId, items })`.
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tableId,
  onCheckout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between">
        {/* Cabeçalho */}
        <div>
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Seu Pedido</h3>
              <p className="text-xs text-slate-500">Mesa {tableId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Lista de Itens do Carrinho */}
          <div className="py-6 text-center text-xs text-slate-400 italic">
            O carrinho está vazio no momento.
            <br />
            (O próximo chat pode integrar o estado global de itens aqui).
          </div>
        </div>

        {/* Rodapé com Total e Botão */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-slate-800">
            <span>Total:</span>
            <span>R$ 0,00</span>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer"
          >
            Enviar Pedido para a Cozinha 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

