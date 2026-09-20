'use client';

import { Globe, UserCheck, CreditCard, DollarSign } from 'lucide-react';
import { DistribucionOrigen, ImpactoMedioPago } from '@/lib/admin/metricas';

interface Props {
  origen: DistribucionOrigen[];
  mediosPago: ImpactoMedioPago[];
  loading?: boolean;
}

export default function OrigenFinanzasCard({ origen, mediosPago, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 animate-pulse h-48"></div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Origen de Reservas */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Origen de Reservas
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Reservas generadas por la Web vs. creadas en el Local
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {origen.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  {item.origen === 'Web' ? (
                    <Globe className="w-4 h-4 text-sky-500" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  )}
                  {item.origen}
                </span>
                <span className="font-bold text-slate-800 dark:text-zinc-100">
                  {item.cantidad} ({item.porcentaje}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.origen === 'Web' ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${item.porcentaje}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impacto por Medio de Pago */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Impacto Financiero por Canal
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Distribución de ingresos y pasarelas utilizadas
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {mediosPago.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  {item.medio}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 dark:text-zinc-100 block">
                  ${item.totalMonto.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">
                  {item.cantidad} turnos ({item.porcentajeUso}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}