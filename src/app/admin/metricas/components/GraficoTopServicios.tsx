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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Servicios Más Demandados
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
              Top de tratamientos según volumen de reservas
            </p>
          </div>
        </div>

        {/* Contenedor del Gráfico */}
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
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1 border border-slate-800">
                        <p className="font-bold text-blue-400">{item.nombre}</p>
                        <p className="text-slate-200 font-medium">Reservas: {item.cantidad}</p>
                        <p className="text-emerald-400 font-black font-mono">
                          Total: ${item.montoTotal.toLocaleString('es-AR')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="cantidad" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}