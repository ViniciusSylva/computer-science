import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CartDrawer } from '../components/CartDrawer';
import { ModalOptionSelect } from '../components/ModalOptionSelect';
import type { CartLine, Category, MenuItem, OptionItem, Order } from '../types';

interface MenuPageProps {
  tableNumber?: number;
  onOrderCreated: (order: Order) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ tableNumber, onOrderCreated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartError, setCartError] = useState('');

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

  const handleAddToCart = (item: MenuItem, selectedOptions: OptionItem[], notes: string) => {
    setCart((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        item,
        quantity: 1,
        selectedOptions,
        notes: notes.trim(),
      },
    ]);
    setCartError('');
  };

  const handleQuantityChange = (lineId: string, quantity: number) => {
    setCart((current) =>
      quantity < 1
        ? current.filter((line) => line.id !== lineId)
        : current.map((line) => (line.id === lineId ? { ...line, quantity } : line))
    );
  };

  const handleCheckout = async () => {
    if (tableNumber === undefined) {
      setCartError('Não foi possível identificar a mesa deste pedido.');
      return;
    }

    setIsSubmitting(true);
    setCartError('');
    try {
      const tables = await api.getTables();
      const table = tables.find((candidate) => candidate.number === tableNumber);
      if (!table) throw new Error(`A Mesa ${tableNumber} não está cadastrada neste restaurante.`);

      const order = await api.createOrder({
        type: 'DINE_IN',
        tableId: table.id,
        items: cart.map((line) => ({
          menuItemId: line.item.id,
          quantity: line.quantity,
          selectedOptionIds: line.selectedOptions.map((option) => option.id),
          notes: line.notes,
        })),
      });

      setCart([]);
      setIsCartOpen(false);
      onOrderCreated(order);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Não foi possível enviar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header & Seletor de Mesa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>🍔</span> Cardápio Digital
          </h2>
          <p className="text-xs text-slate-400">Adicione itens e envie seu pedido para a cozinha</p>
        </div>

        {tableNumber !== undefined && (
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-amber-700/60 bg-amber-950/60 px-3 py-1.5 text-sm font-bold text-amber-200">
              Mesa {tableNumber}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setCartError('');
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Pedido ({cart.reduce((sum, line) => sum + line.quantity, 0)})
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Carregando itens...</div>
      ) : (
        <>
          {/* Categorias (Pills) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {cat.items?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de Produtos */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              {currentCategoryData?.name || 'Itens'}
            </h3>

            {!currentCategoryData?.items || currentCategoryData.items.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-8">Nenhum item cadastrado nesta categoria.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCategoryData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="w-full h-36 mb-3 rounded-lg overflow-hidden bg-slate-800">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                        <span className="font-bold text-sm text-emerald-400 font-mono whitespace-nowrap">
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {item.optionGroups && item.optionGroups.length > 0
                          ? `${item.optionGroups.length} adicionais`
                          : 'Prato padrão'}
                      </span>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <ModalOptionSelect
        key={selectedItem?.id ?? 'no-item'}
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableNumber={tableNumber ?? 0}
        items={cart}
        isSubmitting={isSubmitting}
        error={cartError}
        onQuantityChange={handleQuantityChange}
        onRemove={(lineId) => setCart((current) => current.filter((line) => line.id !== lineId))}
        onCheckout={() => void handleCheckout()}
      />
    </div>
  );
};
