import React, { useEffect, useMemo, useState } from 'react';
import { MenuItem, OptionItem } from '../types';

interface ModalOptionSelectProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedOptions: OptionItem[], notes: string) => void;
}

/**
 * COMPONENTE: Modal de Seleção de Opcionais
 * ----------------------------------------------------
 * Objetivo: Permitir ao cliente escolher o ponto da carne, molhos e adicionais extras.
 * Ponto de extensão para o próximo chat:
 */
export const ModalOptionSelect: React.FC<ModalOptionSelectProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [notes, setNotes] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setNotes('');
    setSelectedOptions({});
    setValidationError('');
  }, [item?.id]);

  const selectedOptionItems = useMemo(
    () =>
      item?.optionGroups?.flatMap((group) =>
        (selectedOptions[group.id] ?? [])
          .map((optionId) => group.options.find((option) => option.id === optionId))
          .filter((option): option is OptionItem => option !== undefined)
      ) ?? [],
    [item, selectedOptions]
  );
  const total = (item?.price ?? 0) + selectedOptionItems.reduce((sum, option) => sum + option.additionalPrice, 0);

  if (!isOpen || !item) return null;

  const toggleOption = (groupId: number, optionId: number, maxSelect: number) => {
    setSelectedOptions((current) => {
      const currentSelection = current[groupId] ?? [];
      const nextSelection = currentSelection.includes(optionId)
        ? currentSelection.filter((id) => id !== optionId)
        : maxSelect === 1
          ? [optionId]
          : currentSelection.length < maxSelect
            ? [...currentSelection, optionId]
            : currentSelection;
      return { ...current, [groupId]: nextSelection };
    });
    setValidationError('');
  };

  const handleAdd = () => {
    const invalidGroup = item.optionGroups?.find(
      (group) => (selectedOptions[group.id]?.length ?? 0) < group.minSelect
    );
    if (invalidGroup) {
      setValidationError(`Selecione pelo menos ${invalidGroup.minSelect} opção(ões) em "${invalidGroup.title}".`);
      return;
    }
    onAddToCart(item, selectedOptionItems, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{item.name}</h3>
            <p className="text-xs text-slate-400">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Grupos de Opcionais (ex: Ponto da Carne, Adicionais) */}
        <div className="space-y-4">
          {item.optionGroups && item.optionGroups.length > 0 ? (
            item.optionGroups.map((group) => (
              <div key={group.id} className="border border-slate-700 rounded-xl p-3 bg-slate-800/60">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {group.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {group.isRequired ? 'Obrigatório' : 'Opcional'}                     ({group.minSelect > 0 ? `Mín. ${group.minSelect} • ` : ''}Máx. {group.maxSelect})
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {group.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer hover:border-amber-400"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type={group.maxSelect === 1 ? 'radio' : 'checkbox'}
                          name={`group-${group.id}`}
                          className="accent-amber-500"
                          checked={(selectedOptions[group.id] ?? []).includes(opt.id)}
                          onChange={() => toggleOption(group.id, opt.id, group.maxSelect)}
                        />
                        <span>{opt.name}</span>
                      </span>
                      {opt.additionalPrice > 0 && (
                        <span className="font-semibold text-amber-400">
                          + R$ {opt.additionalPrice.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Este produto não possui adicionais.</p>
          )}

          {/* Campo de Observações */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Observações do pedido (ex: sem cebola):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma recomendação para a cozinha?"
              className="w-full text-xs text-slate-100 placeholder-slate-500 bg-slate-800 border border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={2}
            />
          </div>
        </div>

        {validationError && (
          <p role="alert" className="text-sm text-rose-300">{validationError}</p>
        )}

        {/* Rodapé com Botão */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-slate-100">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={handleAdd}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};
