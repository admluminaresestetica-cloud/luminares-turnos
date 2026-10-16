'use client';

import React from 'react';
import { Package, BarChart3, Clock, Tags } from 'lucide-react';

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
    {
      label: "Productos",
      valor: totalProductos,
      icono: Package,
      accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Unidades en stock",
      valor: stockTotal,
      icono: BarChart3,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    },
    {
      label: "Pedidos Pendientes",
      valor: pedidosPendientes,
      icono: Clock,
      accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    },
    {
      label: "Categorías activas",
      valor: totalCategorias,
      icono: Tags,
      accent: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
      {metricas.map((m) => {
        const Icono = m.icono;
        return (
          <div
            key={m.label}
            className="group rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-98"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border text-base transition-transform group-hover:scale-105 ${m.accent}`}
              >
                <Icono className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </div>

            <p className="m-0 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
              {m.valor.toLocaleString()}
            </p>
            
            <p className="m-0 mt-1 text-[11px] font-medium leading-tight text-slate-500 dark:text-zinc-400 sm:text-xs">
              {m.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}