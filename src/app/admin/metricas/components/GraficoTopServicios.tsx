'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ServicioTop } from '@/lib/admin/metricas';

interface Props {
  data: ServicioTop[];
}

export default function GraficoTopServicios({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
        No hay datos de servicios solicitados en este rango.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="nombre"
            type="category"
            width={120}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ServicioTop;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                    <p className="font-bold text-violet-300">{item.nombre}</p>
                    <p className="text-slate-200">Reservas: {item.cantidad}</p>
                    <p className="text-emerald-400 font-semibold">
                      Total: ${item.montoTotal.toLocaleString('es-AR')}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}