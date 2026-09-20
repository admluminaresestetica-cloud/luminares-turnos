'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface AppointmentsChartProps {
  data: { name: string; value: number }[];
}

// Mapeo semántico de colores por estado
const COLOR_MAP: Record<string, string> = {
  'Confirmados / Señados': '#10b981', // Verde
  'Confirmado': '#10b981',
  'Pendiente Seña': '#f59e0b',        // Naranja
  'Pendiente': '#f59e0b',
  'Cancelados': '#ef4444',            // Rojo
  'Cancelado': '#ef4444',
  'Completados': '#3b82f6',           // Azul
  'Atendidos': '#3b82f6',
};

const COLOR_DEFAULT = '#8b5cf6';

export default function AppointmentsChart({ data }: AppointmentsChartProps) {
  // Filtramos estados que tengan valor > 0
  const dataFiltrada = data.filter((item) => item.value > 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
          Estado de Turnos
        </h2>
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Distribución por condición
        </p>
      </div>

      <div className="h-64 w-full">
        {dataFiltrada.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Sin turnos registrados en este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataFiltrada}
                cx="50%"
                cy="40%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {dataFiltrada.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLOR_MAP[entry.name] || COLOR_DEFAULT}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}