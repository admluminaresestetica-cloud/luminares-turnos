'use client';

import React from 'react';
import { ComparativaCategorias } from '@/lib/admin/metricas';
import { Zap, HandHeart } from 'lucide-react';

interface CategoriasCardProps {
  data: ComparativaCategorias;
  loading?: boolean;
}

export default function CategoriasCard({ data, loading = false }: CategoriasCardProps) {
  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between space-y-5">
      <div>
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Categorías de Servicio
            </h3>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
              Láser vs. Estética General
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            <div className="h-20 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            <div className="h-20 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Depilación Láser */}
            <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-900/50 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-violet-600 text-white rounded-2xl shadow-md shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-violet-950 dark:text-violet-200 tracking-tight uppercase">
                    Depilación Láser
                  </h4>
                  <p className="text-[11px] font-bold text-violet-700/80 dark:text-violet-400 mt-0.5 font-mono">
                    {data.laser.turnos} {data.laser.turnos === 1 ? 'turno' : 'turnos'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-black font-mono text-violet-950 dark:text-violet-100 tracking-tighter">
                  {formatCurrency(data.laser.ingresos)}
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 mt-0.5">
                  {data.laser.porcentajeIngresos}% del total
                </p>
              </div>
            </div>

            {/* Estética General */}
            <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/50 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-pink-600 text-white rounded-2xl shadow-md shrink-0">
                  <HandHeart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-pink-950 dark:text-pink-200 tracking-tight uppercase">
                    Estética General
                  </h4>
                  <p className="text-[11px] font-bold text-pink-700/80 dark:text-pink-400 mt-0.5 font-mono">
                    {data.estetica.turnos} {data.estetica.turnos === 1 ? 'turno' : 'turnos'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-black font-mono text-pink-950 dark:text-pink-100 tracking-tighter">
                  {formatCurrency(data.estetica.ingresos)}
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 mt-0.5">
                  {data.estetica.porcentajeIngresos}% del total
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}