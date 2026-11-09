import React from 'react';
import type { AuthSession } from '../types';

export type ActiveTab = 'kds' | 'menu' | 'tab' | 'tables' | 'register' | 'admin-clients';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  backendOnline?: boolean | null;
  session: AuthSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  session,
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20">
            🍔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
                {(session?.role === 'RESTAURANT_OWNER' || session?.role === 'TABLE_CUSTOMER') &&
                session.user.restaurantName
                  ? session.user.restaurantName
                  : session?.role === 'MASTER_ADMIN'
                    ? 'Gestão'
                    : 'Restaurante'}
              </h1>

              {/* Badge indicativo do perfil atual */}
              {session?.role === 'MASTER_ADMIN' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                  ADMIN
                </span>
              )}
              {session?.role === 'RESTAURANT_OWNER' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  RESTAURANTE
                </span>
              )}
              {session?.role === 'TABLE_CUSTOMER' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  MESA {session.user.tableNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Dinâmicas de acordo com o Perfil */}
        {(session?.role === 'RESTAURANT_OWNER' || session?.role === 'TABLE_CUSTOMER') && (
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          {/* VISÃO 2: DONO DO RESTAURANTE / RECEPÇÃO / COZINHA */}
          {session?.role === 'RESTAURANT_OWNER' && (
            <>
              <button
                onClick={() => setActiveTab('kds')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'kds'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>🍳</span>
                <span>Cozinha</span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'tables'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>🪑</span>
                <span>Mesas & Recepção</span>
              </button>
            </>
          )}

          {/* VISÃO 3: CLIENTE NA MESA (APENAS Cardápio e Comanda) */}
          {session?.role === 'TABLE_CUSTOMER' && (
            <>
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'menu'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>🍔</span>
                <span>Cardápio</span>
              </button>

              <button
                onClick={() => setActiveTab('tab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'tab'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>📋</span>
                <span>Meus Pedidos</span>
              </button>
            </>
          )}
        </nav>
        )}

        {/* Encerra a sessão atual e retorna à tela inicial */}
        <div className="flex items-center gap-3">
          {session && (
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-800 transition-colors cursor-pointer"
            >
              {session.role === 'TABLE_CUSTOMER' && session.user.lockedCustomerDisplay
                ? 'Sair da tela'
                : session.role === 'TABLE_CUSTOMER'
                  ? 'Sair da mesa'
                  : 'Sair'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
