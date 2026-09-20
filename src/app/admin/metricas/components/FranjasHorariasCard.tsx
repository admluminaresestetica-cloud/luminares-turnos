'use client';

import { DistribucionFranjaHoraria, MetricaNoShow } from '@/lib/admin/metricas';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  franjas: DistribucionFranjaHoraria[];
  noShow: MetricaNoShow;
  loading?: boolean;
}

export default function FranjasHorariasCard({ franjas, noShow, loading }: Props) {
  const totalTurnosValidos = franjas.reduce((acc, item) => acc + item.turnos, 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-pulse h-64" />
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Alerta de No-Shows */}
      <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Tasa de Cancelación / No-Show
            </h4>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {noShow.canceladas} de {noShow.totalReservas} turnos cancelados
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
          {noShow.porcentajeCanceladas}%
        </span>
      </div>

      {/* Ocupación por Franja Horaria */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
            Demanda por Franja Horaria
          </h3>
        </div>

        <div className="space-y-3">
          {franjas.map((item) => {
            const porcentaje =
              totalTurnosValidos > 0 ? Math.round((item.turnos / totalTurnosValidos) * 100) : 0;

            return (
              <div key={item.franja} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-300">
                  <span>{item.franja}</span>
                  <span>
                    {item.turnos} turnos ({porcentaje}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 transition-all duration-500 rounded-full"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}