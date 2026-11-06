import React from 'react';

export type ActiveTab = 'kds' | 'menu' | 'tab' | 'tables';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  backendOnline: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  backendOnline,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20">
            🍔
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-slate-800 leading-tight">
              RestôSaaS
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestor de Cardápio, Pedidos & KDS
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('kds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'kds'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🍳</span>
            <span className="hidden md:inline">Painel</span> KDS
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🍔</span>
            <span>Cardápio</span>
          </button>

          <button
            onClick={() => setActiveTab('tab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'tab'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>📋</span>
            <span>Comanda</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'tables'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🪑</span>
            <span>Mesas</span>
          </button>
        </nav>

        {/* Backend Online Status */}
        <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border bg-white shadow-2xs">
          {backendOnline === true ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 hidden sm:inline">API Online</span>
            </>
          ) : backendOnline === false ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-700 hidden sm:inline">API Offline</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-slate-500 hidden sm:inline">Conectando...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

