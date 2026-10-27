import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Table } from '../types';

/**
 * TELA 4: Gestão do Salão / Mesas (Visão Garçom / Gerente)
 * ----------------------------------------------------
 * Objetivo: Visualizar as mesas do restaurante em tempo real.
 * Funcionalidades:
 * - Grid das mesas de 1 a 6
 * - Identificação de status: Livre (Verde), Ocupada (Laranja)
 * - Exibição de comandas ativas e valor consumido por mesa
 */
export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (err) {
      console.error('Erro ao carregar mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>🪑</span> Gestão de Mesas do Salão
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhe a ocupação das mesas e comandas abertas
          </p>
        </div>

        <button
          onClick={loadTables}
          className="self-start sm:self-auto text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
        >
          🔄 Atualizar Mesas
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Carregando mesas do salão...</div>
      ) : (
        /* Grid das Mesas */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            return (
              <div
                key={table.id}
                className={`rounded-2xl border p-4 text-center shadow-xs transition-all flex flex-col justify-between min-h-[160px] ${
                  isOccupied
                    ? 'border-amber-400 bg-amber-50/50 text-amber-900'
                    : 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    Mesa
                  </span>
                  <span className="text-4xl font-black block my-1">{table.number}</span>
                  <p className="text-[11px] opacity-75">Capacidade: {table.capacity} lugares</p>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                      isOccupied
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    {isOccupied ? '🔴 Ocupada' : '🟢 Disponível'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

