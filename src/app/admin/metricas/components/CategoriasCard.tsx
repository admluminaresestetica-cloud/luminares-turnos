'use client';

import React from 'react';
import { ComparativaCategorias } from '@/lib/admin/metricas';
import { Zap, Sparkles } from 'lucide-react';

interface CategoriasCardProps {
  data: ComparativaCategorias;
  loading?: boolean;
}

export default function CategoriasCard({ data, loading = false }: CategoriasCardProps) {
  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              Categorías de Servicio
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Láser vs. Estética General
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="h-16 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
            <div className="h-16 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Depilación Láser */}
            <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500 text-white rounded-xl shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-violet-950 dark:text-violet-200">
                    Depilación Láser
                  </h4>
                  <p className="text-[11px] text-violet-700 dark:text-violet-400">
                    {data.laser.turnos} {data.laser.turnos === 1 ? 'turno' : 'turnos'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-violet-950 dark:text-violet-100">
                  {formatCurrency(data.laser.ingresos)}
                </span>
                <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                  {data.laser.porcentajeIngresos}% del total
                </p>
              </div>
            </div>

            {/* Estética General */}
            <div className="p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500 text-white rounded-xl shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-pink-950 dark:text-pink-200">
                    Estética General
                  </h4>
                  <p className="text-[11px] text-pink-700 dark:text-pink-400">
                    {data.estetica.turnos} {data.estetica.turnos === 1 ? 'turno' : 'turnos'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-pink-950 dark:text-pink-100">
                  {formatCurrency(data.estetica.ingresos)}
                </span>
                <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
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