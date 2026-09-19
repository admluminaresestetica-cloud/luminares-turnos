'use client';

import React from 'react';

export interface KpiData {
  ingresosTotales: number;
  ingresosVariacion: number;
  turnosTotales: number;
  turnosVariacion: number;
  ticketPromedio: number;
  ticketVariacion: number;
  senasTotales: number;
  senasVariacion: number;
}

interface KpiCardsProps {
  data: KpiData;
  loading?: boolean;
}

export default function KpiCards({ data, loading = false }: KpiCardsProps) {
  const formatCurrency = (val: number) =>
    `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const renderBadge = (variacion: number) => {
    const esPositivo = variacion >= 0;
    const colorBg = esPositivo
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40';

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorBg}`}>
        {esPositivo ? `+${variacion.toFixed(1)}%` : `${variacion.toFixed(1)}%`}
      </span>
    );
  };

  const cards = [
    {
      titulo: 'Ingresos Totales',
      valor: formatCurrency(data.ingresosTotales),
      variacion: data.ingresosVariacion,
      subtexto: 'vs. período anterior',
      icono: (
        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      titulo: 'Turnos Atendidos / Confirmados',
      valor: data.turnosTotales,
      variacion: data.turnosVariacion,
      subtexto: 'vs. período anterior',
      icono: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      titulo: 'Ticket Promedio',
      valor: formatCurrency(data.ticketPromedio),
      variacion: data.ticketVariacion,
      subtexto: 'por turno asistido',
      icono: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      titulo: 'Señas Recaudadas',
      valor: formatCurrency(data.senasTotales),
      variacion: data.senasVariacion,
      subtexto: 'liquidez anticipada',
      icono: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {card.titulo}
            </span>
            <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              {card.icono}
            </div>
          </div>

          {loading ? (
            <div className="h-8 w-28 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
          ) : (
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-zinc-100">
                {card.valor}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {renderBadge(card.variacion)}
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {card.subtexto}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}