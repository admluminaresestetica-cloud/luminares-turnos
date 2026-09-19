'use client';

import React from 'react';
import { DistribucionDiaSemana } from '@/lib/admin/metricas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface GraficoDiasSemanaProps {
  data: DistribucionDiaSemana[];
  loading?: boolean;
}

export default function GraficoDiasSemana({ data, loading = false }: GraficoDiasSemanaProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              Demanda por Día de la Semana
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cantidad de turnos atendidos según el día
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value ?? 0} turnos`, 'Turnos']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="turnos" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}