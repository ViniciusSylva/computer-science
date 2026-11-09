import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Table, TableStatus } from '../types';

interface TablesPageProps {
  onEnterCustomerScreen: (tableNumber: number) => boolean;
}

interface TableForm {
  number: string;
  capacity: string;
}

const tableStatusLabels: Record<TableStatus, string> = {
  AVAILABLE: 'Livre',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
};

export const TablesPage: React.FC<TablesPageProps> = ({ onEnterCustomerScreen }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tableToRemove, setTableToRemove] = useState<Table | null>(null);
  const [tableForm, setTableForm] = useState<TableForm>({ number: '', capacity: '4' });

  useEffect(() => {
    void loadTables();
  }, []);

  const loadTables = async () => {
    setActionError('');
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      setActionError(error instanceof Error ? error.message : 'Não foi possível carregar as mesas.');
    } finally {
      setLoading(false);
    }
  };

  const openNewTableForm = () => {
    const usedNumbers = new Set(tables.map((table) => table.number));
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) nextNumber += 1;
    setEditingTable(null);
    setTableForm({ number: String(nextNumber), capacity: '4' });
    setIsFormOpen(true);
    setFormError('');
    setActionError('');
  };

  const openEditTableForm = (table: Table) => {
    setEditingTable(table);
    setTableForm({ number: String(table.number), capacity: String(table.capacity) });
    setIsFormOpen(true);
    setFormError('');
    setActionError('');
  };

  const handleSaveTable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const number = Number(tableForm.number);
    const capacity = Number(tableForm.capacity);
    if (!Number.isInteger(number) || number < 1 || !Number.isInteger(capacity) || capacity < 1) {
      setFormError('Informe um número de mesa e uma quantidade de lugares válidos.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    setActionError('');
    try {
      if (editingTable) {
        await api.updateTable(editingTable.id, { number, capacity });
      } else {
        await api.createTable({ number, capacity });
      }
      setEditingTable(null);
      setIsFormOpen(false);
      await loadTables();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a mesa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (table: Table, status: TableStatus) => {
    setIsSaving(true);
    setActionError('');
    try {
      const updatedTable = await api.updateTable(table.id, { status });
      setTables((current) => current.map((item) => item.id === table.id ? updatedTable : item));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível atualizar o status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTable = async (table: Table) => {
    if (table.status !== 'AVAILABLE') {
      setActionError(`Altere a Mesa ${table.number} para Livre antes de removê-la.`);
      return;
    }

    setIsSaving(true);
    setActionError('');
    try {
      await api.deleteTable(table.id);
      setTables((current) => current.filter((item) => item.id !== table.id));
      setTableToRemove(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível remover a mesa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <span>🪑</span> Mesas
          </h2>
          <p className="mt-1 text-xs text-slate-400">Gerencie os lugares e o status de cada mesa.</p>
        </div>
        <button
          onClick={openNewTableForm}
          className="self-start rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 sm:self-auto"
        >
          + Cadastrar mesa
        </button>
      </div>

      {actionError && (
        <div role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 px-4 py-3 text-sm text-rose-300">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Carregando mesas...</div>
      ) : tables.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
          Nenhuma mesa cadastrada. Use “Cadastrar mesa” para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <article key={table.id} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mesa</p>
                  <h3 className="my-1 text-4xl font-black text-white">{table.number}</h3>
                  <p className="text-sm text-slate-400">{table.capacity} lugares</p>
                </div>
                <label className="space-y-1 text-xs font-semibold text-slate-400">
                  Status
                  <select
                    value={table.status}
                    disabled={isSaving}
                    onChange={(event) => void handleStatusChange(table, event.target.value as TableStatus)}
                    className="block rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.entries(tableStatusLabels).map(([status, label]) => (
                      <option key={status} value={status}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => openEditTableForm(table)}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (!onEnterCustomerScreen(table.number)) {
                      setActionError('Configure uma senha para esta conta antes de abrir a tela dos clientes.');
                    }
                  }}
                  className="col-span-2 rounded-lg border border-blue-700/70 bg-blue-950/60 px-2 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-900/70"
                >
                  Deixar na tela dos clientes
                </button>
                <button
                  onClick={() => setTableToRemove(table)}
                  disabled={isSaving || table.status !== 'AVAILABLE'}
                  className="col-span-3 rounded-lg border border-rose-900/70 bg-rose-950/40 px-2 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remover mesa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => void handleSaveTable(event)}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-100">
              {editingTable ? `Editar Mesa ${editingTable.number}` : 'Cadastrar mesa'}
            </h2>
            <label className="block space-y-1 text-sm font-medium text-slate-300">
              Número da mesa
              <input
                type="number"
                min={1}
                step={1}
                required
                value={tableForm.number}
                onChange={(event) => {
                  setTableForm((form) => ({ ...form, number: event.target.value }));
                  setFormError('');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block space-y-1 text-sm font-medium text-slate-300">
              Número de lugares
              <input
                type="number"
                min={1}
                step={1}
                required
                value={tableForm.capacity}
                onChange={(event) => {
                  setTableForm((form) => ({ ...form, capacity: event.target.value }));
                  setFormError('');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              />
            </label>
            {formError && (
              <p role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 px-3 py-2 text-sm text-rose-300">
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingTable(null);
                  setIsFormOpen(false);
                  setFormError('');
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar mesa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tableToRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-table-title"
            className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div>
              <h2 id="remove-table-title" className="text-lg font-bold text-slate-100">
                Remover mesa
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Tem certeza que deseja remover a Mesa {tableToRemove.number}?
              </p>
            </div>
            {actionError && (
              <p role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 px-3 py-2 text-sm text-rose-300">
                {actionError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  setTableToRemove(null);
                  setActionError('');
                }}
                disabled={isSaving}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleRemoveTable(tableToRemove)}
                disabled={isSaving}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {isSaving ? 'Removendo...' : 'Remover mesa'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
