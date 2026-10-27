import React, { useState } from 'react';
import { MenuItem } from '../types';

interface ModalOptionSelectProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedOptions: any[], notes: string) => void;
}

/**
 * COMPONENTE: Modal de Seleção de Opcionais
 * ----------------------------------------------------
 * Objetivo: Permitir ao cliente escolher o ponto da carne, molhos e adicionais extras.
 * Ponto de extensão para o próximo chat:
 * - Implementar a seleção múltipla/única respeitando minSelect e maxSelect dos optionGroups.
 * - Calcular o total dinâmico (preço base + adicionais).
 */
export const ModalOptionSelect: React.FC<ModalOptionSelectProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Grupos de Opcionais (ex: Ponto da Carne, Adicionais) */}
        <div className="space-y-4">
          {item.optionGroups && item.optionGroups.length > 0 ? (
            item.optionGroups.map((group) => (
              <div key={group.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {group.isRequired ? 'Obrigatório' : 'Opcional'} (Até {group.maxSelect})
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  {group.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-amber-400"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type={group.maxSelect === 1 ? 'radio' : 'checkbox'}
                          name={`group-${group.id}`}
                          className="accent-amber-500"
                        />
                        <span>{opt.name}</span>
                      </span>
                      {opt.additionalPrice > 0 && (
                        <span className="font-semibold text-amber-700">
                          + R$ {opt.additionalPrice.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">Este produto não possui adicionais.</p>
          )}

          {/* Campo de Observações */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Observações do pedido (ex: sem cebola):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma recomendação para a cozinha?"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={2}
            />
          </div>
        </div>

        {/* Rodapé com Botão */}
        <div className="pt-3 border-t flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">
            R$ {item.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(item, [], notes)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

