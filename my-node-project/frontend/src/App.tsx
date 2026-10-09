import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md shadow-amber-500/20">
          🍔
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestor de Cardápio Digital & Pedidos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            SaaS para Restaurantes com Painel KDS e Mesas
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Frontend Inicializado com Sucesso
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-left">
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <span className="text-xl block mb-1">📋</span>
            <h2 className="font-semibold text-xs text-slate-800">Cardápio Digital</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Visão do cliente e comanda</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <span className="text-xl block mb-1">🍳</span>
            <h2 className="font-semibold text-xs text-slate-800">Painel KDS</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Fila de pedidos na cozinha</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <span className="text-xl block mb-1">🪑</span>
            <h2 className="font-semibold text-xs text-slate-800">Mesas</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Gestão de salão em tempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
