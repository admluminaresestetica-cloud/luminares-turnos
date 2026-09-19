'use client';

import React from 'react';
import { DesgloseMedioPago } from '@/lib/admin/metricas';
import { CreditCard, Wallet, ArrowRightLeft, HelpCircle } from 'lucide-react';

interface MediosPagoCardProps {
  data: DesgloseMedioPago[];
  loading?: boolean;
}

export default function MediosPagoCard({ data, loading = false }: MediosPagoCardProps) {
  const getIcon = (medio: string) => {
    switch (medio) {
      case 'Efectivo':
        return <Wallet className="w-4 h-4 text-emerald-500" />;
      case 'Transferencia':
        return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      case 'Mercado Pago':
        return <CreditCard className="w-4 h-4 text-sky-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getColorBar = (medio: string) => {
    switch (medio) {
      case 'Efectivo':
        return 'bg-emerald-500';
      case 'Transferencia':
        return 'bg-blue-500';
      case 'Mercado Pago':
        return 'bg-sky-400';
      default:
        return 'bg-slate-300 dark:bg-zinc-700';
    }
  };

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const totalRecaudado = data.reduce((acc, item) => acc + item.monto, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">
              Desglose por Medio de Pago
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Distribución del dinero ingresado en el período
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 rounded-lg">
            {formatCurrency(totalRecaudado)}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-full" />
            <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
            <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No se registraron cobros en el período seleccionado.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Barra Proporcional Multinivel */}
            <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              {data.map((item, index) => (
                <div
                  key={index}
                  style={{ width: `${item.porcentaje}%` }}
                  className={`h-full ${getColorBar(item.medio)} transition-all duration-500`}
                  title={`${item.medio}: ${item.porcentaje}%`}
                />
              ))}
            </div>

            {/* Listado de Medios de Pago */}
            <div className="space-y-3">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                      {getIcon(item.medio)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                        {item.medio}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.cantidad} {item.cantidad === 1 ? 'operación' : 'operaciones'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800 dark:text-zinc-100">
                      {formatCurrency(item.monto)}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      {item.porcentaje}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}