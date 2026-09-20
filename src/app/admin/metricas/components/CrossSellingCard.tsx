'use client';

import { ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { MetricaCrossSelling } from '@/lib/admin/metricas';

interface Props {
  data: MetricaCrossSelling;
  loading?: boolean;
}

export default function CrossSellingCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 h-full animate-pulse flex flex-col justify-between">
        <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-500" />
            Venta Cruzada (Cross-Selling)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Conversión de visitas a venta de productos en gabinete
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasa de conversión */}
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40">
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
            Tasa de Conversión a Producto
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-violet-700 dark:text-violet-300">
              {data.tasaConversion}%
            </span>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              ({data.turnosConProducto} de {data.totalTurnos} turnos)
            </span>
          </div>
        </div>

        {/* Comparativa Ticket Promedio */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Impacto en Ticket Promedio
          </span>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Solo servicio:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                ${data.ticketMedioSoloServicio.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">Servicio + Producto:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ${data.ticketMedioConProducto.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}