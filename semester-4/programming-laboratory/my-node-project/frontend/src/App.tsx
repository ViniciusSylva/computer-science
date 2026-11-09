import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { KDSPage } from './pages/KDSPage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { TablesPage } from './pages/TablesPage';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { api } from './services/api';
import { authStorage } from './services/authStorage';
import type { AuthSession, Order } from './types';

/**
 * APP PRINCIPAL (Orquestrador do Frontend)
 * ----------------------------------------------------
 * Gerencia a sessão do usuário e direciona para as telas permitidas:
 * 1. ADMINISTRADOR: AdminClientsPage (Gestão de clientes, prazos e licenças)
 * 2. RESTAURANT OWNER (Estabelecimento): KDSPage (Cozinha) + TablesPage (Recepção/Mesas)
 * 3. TABLE CUSTOMER (Cliente na Mesa): MenuPage (Cardápio) + OrderTrackingPage (Comanda)
 * 4. SEM SESSÃO: RegistrationPage (Login / Cadastro)
 */
export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Lê parâmetros da URL para identificar se é uma mesa direta (Ex: ?mesa=3 ou ?table=3)
  const getTableFromUrl = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('mesa') || params.get('table');
    return tableParam ? parseInt(tableParam, 10) : null;
  };

  const [session, setSession] = useState<AuthSession | null>(() => {
    const urlTable = getTableFromUrl();
    if (urlTable) {
      return {
        role: 'TABLE_CUSTOMER',
        user: {
          id: `customer-table-${urlTable}`,
          name: `Cliente Mesa #${urlTable}`,
          email: `mesa${urlTable}@restaurante.local`,
          tableNumber: urlTable,
        },
      };
    }
    return authStorage.getSession();
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [ownerSessionBeforeDisplay, setOwnerSessionBeforeDisplay] = useState<AuthSession | null>(
    () => authStorage.getCustomerDisplayOwnerSession()
  );
  const [isExitPasswordOpen, setIsExitPasswordOpen] = useState(false);
  const [exitPassword, setExitPassword] = useState('');
  const [exitPasswordError, setExitPasswordError] = useState('');

  // Define a aba inicial com base na sessão
  useEffect(() => {
    if (!session) {
      setActiveTab('register');
    } else if (session.role === 'MASTER_ADMIN') {
      setActiveTab('admin-clients');
    } else if (session.role === 'RESTAURANT_OWNER') {
      setActiveTab('kds');
    } else if (session.role === 'TABLE_CUSTOMER') {
      setActiveTab('menu');
    }
  }, [session]);

  // Monitoramento de saúde da API
  useEffect(() => {
    const checkBackend = async () => {
      const isOnline = await api.checkHealth();
      setBackendOnline(isOnline);
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    authStorage.setSession(newSession);
    if (newSession.role === 'MASTER_ADMIN') {
      navigate('/admin/clientes');
    }
  };

  const handleLogout = () => {
    if (session?.role === 'TABLE_CUSTOMER' && session.user.lockedCustomerDisplay) {
      setIsExitPasswordOpen(true);
      setExitPassword('');
      setExitPasswordError('');
      return;
    }

    authStorage.clearSession();
    setSession(null);
    setActiveTab('register');
    setOwnerSessionBeforeDisplay(null);
    navigate('/');
  };

  const handleEnterCustomerDisplay = (tableNumber: number): boolean => {
    if (session?.role !== 'RESTAURANT_OWNER') {
      return false;
    }

    if (!authStorage.hasPassword(session.user.email)) return false;

    const customerSession: AuthSession = {
      role: 'TABLE_CUSTOMER',
      user: {
        id: `display-table-${tableNumber}`,
        name: `Cliente Mesa ${tableNumber}`,
        email: session.user.email,
        restaurantName: session.user.restaurantName,
        tableNumber,
        lockedCustomerDisplay: true,
      },
    };
    authStorage.setCustomerDisplaySession(session, customerSession);
    setOwnerSessionBeforeDisplay(session);
    setSession(customerSession);
    setActiveTab('menu');
    return true;
  };

  const handleOrderCreated = (order: Order) => {
    setCurrentOrder(order);
    setActiveTab('tab');
  };

  const handleExitCustomerDisplay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ownerSession =
      ownerSessionBeforeDisplay ?? authStorage.getCustomerDisplayOwnerSession();
    try {
      if (
        ownerSession?.role !== 'RESTAURANT_OWNER' ||
        !(await authStorage.verifyPassword(ownerSession.user.email, exitPassword))
      ) {
        setExitPasswordError('Senha incorreta. Confirme a senha usada para entrar na conta.');
        return;
      }

      authStorage.restoreCustomerDisplayOwnerSession();
      setSession(ownerSession);
      setOwnerSessionBeforeDisplay(null);
      setActiveTab('tables');
      setIsExitPasswordOpen(false);
      setExitPassword('');
      setExitPasswordError('');
    } catch (error) {
      setExitPasswordError(
        error instanceof Error ? error.message : 'Não foi possível validar a senha da conta.'
      );
    }
  };

  const kitchenRoute = currentPath.match(/^\/admin\/clientes\/([^/]+)\/cozinha\/?$/);
  const kitchenClient = kitchenRoute
    ? authStorage.getClients().find((client) => client.id === decodeURIComponent(kitchenRoute[1]))
    : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior Adaptável */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
        session={session}
        onLogout={handleLogout}
      />

      {/* Conteúdo da Tela Ativa */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Se não autenticado, exibe a tela de login/cadastro/seleção de mesa */}
        {!session && (
          <RegistrationPage onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Master Admin */}
        {session?.role === 'MASTER_ADMIN' && currentPath === '/admin/clientes' && (
          <AdminClientsPage
            onOpenKitchen={(client) =>
              navigate(`/admin/clientes/${encodeURIComponent(client.id)}/cozinha`)
            }
          />
        )}

        {session?.role === 'MASTER_ADMIN' && kitchenClient && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cozinha da conta
                </p>
                <h2 className="text-lg font-bold text-slate-100">
                  {kitchenClient.restaurantName}
                </h2>
                <p className="mt-1 text-xs text-amber-300">
                  Demonstração: o backend ainda compartilha os pedidos entre contas.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/clientes')}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Voltar para clientes
              </button>
            </div>
            <KDSPage />
          </section>
        )}

        {session?.role === 'MASTER_ADMIN' &&
          currentPath !== '/admin/clientes' &&
          !kitchenClient && (
            <AdminClientsPage
              onOpenKitchen={(client) =>
                navigate(`/admin/clientes/${encodeURIComponent(client.id)}/cozinha`)
              }
            />
        )}

        {/* Dono do Restaurante / Equipe */}
        {session?.role === 'RESTAURANT_OWNER' && (
          <>
            {activeTab === 'kds' && <KDSPage />}
            {activeTab === 'tables' && (
              <TablesPage onEnterCustomerScreen={handleEnterCustomerDisplay} />
            )}
          </>
        )}

        {/* Cliente na Mesa (Apenas Cardápio e Acompanhamento) */}
        {session?.role === 'TABLE_CUSTOMER' && (
          <>
            <div className={activeTab === 'menu' ? 'contents' : 'hidden'}>
              <MenuPage
                tableNumber={session.user.tableNumber}
                onOrderCreated={handleOrderCreated}
              />
            </div>
            <div className={activeTab === 'tab' ? 'contents' : 'hidden'}>
              <OrderTrackingPage
                tableNumber={session.user.tableNumber}
                initialOrder={currentOrder}
              />
            </div>
          </>
        )}
      </main>

      {isExitPasswordOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleExitCustomerDisplay}
            className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-100">Voltar à conta</h2>
              <p className="mt-1 text-sm text-slate-400">
                Digite a senha da conta do restaurante para sair da tela dos clientes.
              </p>
            </div>
            <label className="block space-y-1 text-sm font-medium text-slate-300">
              Senha da conta
              <input
                autoComplete="new-password"
                name="customer-display-exit-password"
                type="password"
                value={exitPassword}
                placeholder="Digite a senha da conta"
                onChange={(event) => {
                  setExitPassword(event.target.value);
                  setExitPasswordError('');
                }}
                className="exit-password-input w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                required
              />
            </label>
            {exitPasswordError && (
              <p role="alert" className="text-sm text-rose-300">
                {exitPasswordError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExitPasswordOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Continuar na tela
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Confirmar senha
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default App;
