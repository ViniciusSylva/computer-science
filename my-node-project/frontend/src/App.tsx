import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { KDSPage } from './pages/KDSPage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { TablesPage } from './pages/TablesPage';
import { api } from './services/api';

/**
 * APP PRINCIPAL (Orquestrador do Frontend)
 * ----------------------------------------------------
 * Alterna entre as telas da aplicação:
 * 1. KDSPage: Painel KDS da Cozinha (Tempo Real com SSE)
 * 2. MenuPage: Cardápio Digital do Cliente (Categorias e Opcionais)
 * 3. OrderTrackingPage: Comanda Digital (Progresso do Pedido)
 * 4. TablesPage: Gestão de Mesas do Salão
 */
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kds');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await api.checkHealth();
      setBackendOnline(isOnline);
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
      />

      {/* Conteúdo da Tela Ativa */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'kds' && <KDSPage />}
        {activeTab === 'menu' && <MenuPage />}
        {activeTab === 'tab' && <OrderTrackingPage />}
        {activeTab === 'tables' && <TablesPage />}
      </main>
    </div>
  );
};

export default App;
