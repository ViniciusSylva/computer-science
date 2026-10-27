import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Category, MenuItem } from '../types';

/**
 * TELA 2: Cardápio Digital (Visão do Cliente)
 * ----------------------------------------------------
 * Objetivo: Navegação de itens, escolha de complementos e realização de pedidos.
 * Funcionalidades:
 * - Seleção de Mesa (1 a 6) ou Delivery
 * - Filtro de produtos por Categoria (GET /api/categories)
 * - Botão para abrir o Modal de personalização/adicionais
 * - Botão flutuante para abrir o Carrinho de compras
 */
export const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar cardápio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: MenuItem) => {
    // Ponto de extensão para o próximo chat:
    // Abrir o Modal de Opcionais (ModalOptionSelect) com o item selecionado
    alert(`Item selecionado: ${item.name} - R$ ${item.price.toFixed(2)}.\n(O próximo chat pode abrir o ModalOptionSelect aqui).`);
  };

  const currentCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header & Seletor de Mesa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>🍔</span> Cardápio Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Selecione seus itens e complementos favoritos
          </p>
        </div>

        {/* Mesa selecionada */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Sua Mesa:</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                Mesa {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando cardápio...</div>
      ) : (
        <>
          {/* Categorias (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon || '🍽️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Grid de Produtos */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>{currentCategoryData?.icon}</span> {currentCategoryData?.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCategoryData?.items?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-36 bg-slate-100 rounded-xl overflow-hidden mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    
                    {/* Badge de opcionais */}
                    {item.optionGroups && item.optionGroups.length > 0 && (
                      <div className="mt-2 text-[11px] font-medium text-amber-700 bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-200">
                        Possui adicionais personalizáveis
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={() => handleSelectItem(item)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Personalizar +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

