import React, { useState } from 'react';
import { authStorage } from '../services/authStorage';
import type { RestaurantClient } from '../types';
import './AdminClientsPage.css';

interface AdminClientsPageProps {
  onOpenKitchen: (client: RestaurantClient) => void;
}

export const AdminClientsPage: React.FC<AdminClientsPageProps> = ({ onOpenKitchen }) => {
  const [clients, setClients] = useState<RestaurantClient[]>(authStorage.getClients());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<RestaurantClient | null>(null);
  const [editError, setEditError] = useState('');
  const [passwordClient, setPasswordClient] = useState<RestaurantClient | null>(null);
  const [accountPassword, setAccountPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    restaurantName: '',
    email: '',
    phone: '',
    plan: 'TRIAL' as 'TRIAL' | 'MONTHLY' | 'ANNUAL',
    daysToAdd: 30,
  });

  const refreshClients = () => {
    setClients(authStorage.getClients());
  };

  const handleExtend = (id: string, days: number) => {
    authStorage.extendDeadlineDays(id, days);
    refreshClients();
  };

  const handleApprove = (id: string) => {
    authStorage.approveClient(id);
    refreshClients();
  };

  const handleSetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordClient) return;

    try {
      await authStorage.setPassword(passwordClient.email, accountPassword);
      setPasswordClient(null);
      setAccountPassword('');
      setPasswordError('');
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : 'Não foi possível definir a senha da conta.'
      );
    }
  };

  const handleToggleBlock = (client: RestaurantClient) => {
    const nextStatus = client.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    authStorage.updateClient(client.id, { status: nextStatus });
    refreshClients();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o cliente "${name}"?`)) {
      authStorage.deleteClient(id);
      refreshClients();
    }
  };

  const handleEditClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClient) return;

    const email = editingClient.email.trim();
    if (!editingClient.name.trim() || !editingClient.restaurantName.trim() || !email) {
      setEditError('Preencha o nome do responsável, restaurante e e-mail.');
      return;
    }

    const duplicateEmail = clients.some(
      (client) => client.id !== editingClient.id && client.email.toLowerCase() === email.toLowerCase()
    );
    if (duplicateEmail) {
      setEditError('Já existe outra conta cadastrada com este e-mail.');
      return;
    }
    if (!editingClient.expirationDate) {
      setEditError('Informe a data de validade da conta.');
      return;
    }

    try {
      const updated = authStorage.updateClient(editingClient.id, {
        name: editingClient.name.trim(),
        restaurantName: editingClient.restaurantName.trim(),
        email,
        phone: editingClient.phone?.trim() || '',
        plan: editingClient.plan,
        status: editingClient.status,
        expirationDate: editingClient.expirationDate,
      });
      if (!updated) throw new Error('Não foi possível localizar este cliente.');
      setEditingClient(null);
      setEditError('');
      refreshClients();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.');
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email || !newClient.restaurantName) return;

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + Number(newClient.daysToAdd));

    authStorage.addClient({
      name: newClient.name,
      restaurantName: newClient.restaurantName,
      email: newClient.email,
      phone: newClient.phone,
      plan: newClient.plan,
      status: 'ACTIVE',
      expirationDate: expiration.toISOString().split('T')[0],
    });

    setIsModalOpen(false);
    setNewClient({
      name: '',
      restaurantName: '',
      email: '',
      phone: '',
      plan: 'TRIAL',
      daysToAdd: 30,
    });
    refreshClients();
  };

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const expiredClients = clients.filter((c) => c.status === 'EXPIRED').length;
  const pendingClients = clients.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="admin-clients-page">
      {/* Top Header */}
      <div className="admin-header-card">
        <div>
          <h1 className="admin-header-title">Gestão de Restaurantes</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total de Restaurantes</div>
          <div className="admin-stat-value">{totalClients}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label text-emerald-600">Assinaturas Ativas</div>
          <div className="admin-stat-value text-emerald-600">{activeClients}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label text-rose-600">Prazos Vencidos</div>
          <div className="admin-stat-value text-rose-600">{expiredClients}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label text-amber-300">Aguardando Aprovação</div>
          <div className="admin-stat-value text-amber-300">{pendingClients}</div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="admin-clients-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurante / Dono</th>
              <th>Contato</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Validade / Prazo</th>
              <th style={{ textAlign: 'right' }}>Ações de Gestão</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const isPast = new Date(c.expirationDate) < new Date();
              const displayStatus = isPast && c.status === 'ACTIVE' ? 'EXPIRED' : c.status;

              return (
                <tr key={c.id}>
                  <td>
                    <div className="font-bold text-slate-100">{c.restaurantName}</div>
                    <div className="text-xs text-slate-500">{c.name}</div>
                  </td>
                  <td>
                    <div className="text-xs font-mono text-slate-300">{c.email}</div>
                    {c.phone && <div className="text-xs text-slate-500">{c.phone}</div>}
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.plan}
                    </span>
                  </td>
                  <td>
                    {displayStatus === 'ACTIVE' && (
                      <span className="status-badge status-badge--active">● Ativo</span>
                    )}
                    {displayStatus === 'EXPIRED' && (
                      <span className="status-badge status-badge--expired">● Vencido</span>
                    )}
                    {displayStatus === 'BLOCKED' && (
                      <span className="status-badge status-badge--blocked">● Bloqueado</span>
                    )}
                    {displayStatus === 'PENDING' && (
                      <span className="status-badge status-badge--pending">● Pendente</span>
                    )}
                  </td>
                  <td>
                    <div className="font-mono text-xs font-semibold text-slate-300">
                      {c.expirationDate}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions justify-end">
                      <button
                        onClick={() => {
                          setEditingClient({ ...c });
                          setEditError('');
                        }}
                        className="btn-action"
                        title={`Editar dados de ${c.restaurantName}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onOpenKitchen(c)}
                        className="btn-action btn-action--extend"
                        title={`Abrir a cozinha de ${c.restaurantName}`}
                      >
                        Cozinha
                      </button>
                      <button
                        onClick={() => {
                          setPasswordClient(c);
                          setAccountPassword('');
                          setPasswordError('');
                        }}
                        className="btn-action"
                        title={`Definir senha para ${c.email}`}
                      >
                        Senha
                      </button>
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="btn-action btn-action--approve"
                        >
                          Aprovar
                        </button>
                      )}
                      {c.status !== 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleExtend(c.id, 15)}
                            className="btn-action btn-action--extend"
                            title="Aumentar prazo em 15 dias"
                          >
                            +15d
                          </button>
                          <button
                            onClick={() => handleExtend(c.id, 30)}
                            className="btn-action btn-action--extend"
                            title="Aumentar prazo em 30 dias"
                          >
                            +30d
                          </button>
                          <button
                            onClick={() => handleToggleBlock(c)}
                            className="btn-action btn-action--block"
                          >
                            {c.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(c.id, c.restaurantName)}
                        className="btn-action btn-action--delete"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Adicionar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-restaurant-title"
            className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-700"
          >
            <h2 id="create-restaurant-title" className="text-lg font-bold text-slate-100 mb-1">
              Cadastrar Novo Restaurante
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Crie a conta de acesso para um proprietário de estabelecimento parceiro.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Estabelecimento / Restaurante
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Parrilla Grill"
                  value={newClient.restaurantName}
                  onChange={(e) => setNewClient({ ...newClient, restaurantName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Proprietário / Responsável
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail de Login</label>
                <input
                  required
                  type="email"
                  placeholder="proprietario@restaurante.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prazo Inicial (Dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newClient.daysToAdd}
                    onChange={(e) =>
                      setNewClient({ ...newClient, daysToAdd: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Salvar Restaurante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingClient && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditClient}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-100">Editar dados do cliente</h2>
              <p className="mt-1 text-sm text-slate-400">
                Atualize os dados da conta de {editingClient.restaurantName}.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                Restaurante
                <input
                  required
                  value={editingClient.restaurantName}
                  onChange={(event) => setEditingClient({ ...editingClient, restaurantName: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                Nome do proprietário
                <input
                  required
                  value={editingClient.name}
                  onChange={(event) => setEditingClient({ ...editingClient, name: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                E-mail de acesso
                <input
                  required
                  type="email"
                  value={editingClient.email}
                  onChange={(event) => setEditingClient({ ...editingClient, email: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                Telefone
                <input
                  value={editingClient.phone ?? ''}
                  onChange={(event) => setEditingClient({ ...editingClient, phone: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                Plano
                <select
                  value={editingClient.plan}
                  onChange={(event) => setEditingClient({
                    ...editingClient,
                    plan: event.target.value as RestaurantClient['plan'],
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="TRIAL">Teste</option>
                  <option value="MONTHLY">Mensal</option>
                  <option value="ANNUAL">Anual</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                Status da conta
                <select
                  value={editingClient.status}
                  onChange={(event) => setEditingClient({
                    ...editingClient,
                    status: event.target.value as RestaurantClient['status'],
                  })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="EXPIRED">Vencido</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300 sm:col-span-2">
                Validade da conta
                <input
                  required
                  type="date"
                  value={editingClient.expirationDate}
                  onChange={(event) => setEditingClient({ ...editingClient, expirationDate: event.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
            </div>

            {editError && <p role="alert" className="text-sm text-rose-300">{editError}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-700 pt-3">
              <button
                type="button"
                onClick={() => {
                  setEditingClient(null);
                  setEditError('');
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              void handleSetPassword(event);
            }}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-100">Definir senha da conta</h2>
              <p className="mt-1 text-sm text-slate-400">{passwordClient.email}</p>
            </div>
            <label className="block space-y-1 text-sm font-medium text-slate-300">
              Nova senha (mínimo 8 caracteres)
              <input
                autoFocus
                type="password"
                minLength={8}
                required
                value={accountPassword}
                onChange={(event) => {
                  setAccountPassword(event.target.value);
                  setPasswordError('');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              />
            </label>
            {passwordError && (
              <p role="alert" className="text-sm text-rose-300">
                {passwordError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPasswordClient(null)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Salvar senha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
