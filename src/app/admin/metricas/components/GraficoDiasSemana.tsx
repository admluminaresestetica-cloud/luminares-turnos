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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Demanda por Día de la Semana
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
              Cantidad de turnos atendidos según el día
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-56 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value ?? 0} turnos`, 'Turnos']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    border: '1px solid #1e293b',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                  }}
                />
                <Bar dataKey="turnos" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}