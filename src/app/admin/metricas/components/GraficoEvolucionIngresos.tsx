'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { SerieIngresosPorFecha } from '@/lib/admin/metricas';

interface Props {
  data: SerieIngresosPorFecha[];
}

export default function GraficoEvolucionIngresos({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
        No hay datos de ingresos registrados para este período.
      </div>
    );
  }

  const formatearFecha = (str: string) => {
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return str;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatearFecha}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toLocaleString('es-AR')}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as SerieIngresosPorFecha;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                    <p className="font-semibold text-slate-300">{label}</p>
                    <p className="text-emerald-400 font-bold text-sm">
                      Recaudación: ${item.ingresos.toLocaleString('es-AR')}
                    </p>
                    <p className="text-slate-300">{item.turnos} turnos atendidos</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}