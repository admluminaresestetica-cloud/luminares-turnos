'use client';

import { ShoppingBag, TrendingUp } from 'lucide-react';
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
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 space-y-5">
      
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 rounded-2xl border border-violet-200/60 dark:border-violet-800/40 shadow-2xs shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Venta Cruzada (Cross-Selling)
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
              Conversión de visitas a venta de productos en gabinete
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tasa de conversión */}
        <div className="p-4 sm:p-5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 flex flex-col justify-between space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Tasa de Conversión a Producto
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-black font-mono text-violet-700 dark:text-violet-300 tracking-tight">
              {data.tasaConversion}%
            </span>
            <span className="text-xs font-bold text-violet-600/80 dark:text-violet-400/80">
              ({data.turnosConProducto} de {data.totalTurnos} turnos)
            </span>
          </div>
        </div>

        {/* Comparativa Ticket Promedio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            Impacto en Ticket Promedio
          </span>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-zinc-400 font-medium">Solo servicio:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-zinc-200">
                ${data.ticketMedioSoloServicio.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-emerald-200/50 dark:border-emerald-900/40">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">Servicio + Producto:</span>
              <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                ${data.ticketMedioConProducto.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}