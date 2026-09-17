'use client';

import React from 'react';

interface MetricasHeaderProps {
  totalProductos: number;
  stockTotal: number;
  pedidosPendientes: number;
  totalCategorias: number;
}

export default function MetricasHeader({
  totalProductos,
  stockTotal,
  pedidosPendientes,
  totalCategorias,
}: MetricasHeaderProps) {
  const metricas = [
    { label: "Productos", valor: totalProductos, icono: "📦", accent: "bg-blue-50 text-blue-600" },
    { label: "Unidades en stock", valor: stockTotal, icono: "📊", accent: "bg-emerald-50 text-emerald-600" },
    { label: "Pedidos Pendientes", valor: pedidosPendientes, icono: "⏳", accent: "bg-amber-50 text-amber-600" },
    { label: "Categorías activas", valor: totalCategorias, icono: "🏷️", accent: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
      {metricas.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-12px_rgba(11,15,20,0.15)] active:scale-95 sm:p-5"
        >
          <span
            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full text-base sm:h-10 sm:w-10 ${m.accent}`}
          >
            {m.icono}
          </span>
          <p className="m-0 text-2xl font-bold leading-none text-[#12151B] sm:text-3xl">
            {m.valor}
          </p>
          <p className="m-0 mt-1.5 text-[11px] font-medium leading-tight text-[#6B675F] sm:text-xs">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  );
}