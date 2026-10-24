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
  <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-all space-y-6">
    {/* Alerta de No-Shows / Cancelaciones */}
    <div className="flex items-center justify-between p-4 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/20 rounded-2xl transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-rose-900 dark:text-rose-200 tracking-tight">
            Tasa de Cancelación / No-Show
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
            {noShow.canceladas} de {noShow.totalReservas} turnos cancelados
          </p>
        </div>
      </div>
      <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight shrink-0 pl-2">
        {noShow.porcentajeCanceladas}%
      </span>
    </div>

    {/* Ocupación por Franja Horaria */}
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
          <Clock className="w-4 h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          Demanda por Franja Horaria
        </h3>
      </div>

      <div className="space-y-3.5">
        {franjas.map((item) => {
          const porcentaje =
            totalTurnosValidos > 0 ? Math.round((item.turnos / totalTurnosValidos) * 100) : 0;

          return (
            <div key={item.franja} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span className="font-medium text-slate-600 dark:text-zinc-400">{item.franja}</span>
                <span className="font-mono text-slate-800 dark:text-zinc-200">
                  <strong className="text-slate-900 dark:text-white font-bold">{item.turnos}</strong> turnos{' '}
                  <span className="text-slate-400 dark:text-zinc-500">({porcentaje}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-zinc-700/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 rounded-full"
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