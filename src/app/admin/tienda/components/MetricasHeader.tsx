'use client';

import React from 'react';
import { Package, BarChart3, Clock, Tags } from 'lucide-react';

interface MetricasHeaderProps {
  totalProductos?: number;
  stockTotal?: number;
  pedidosPendientes?: number;
  totalCategorias?: number;
}

export default function MetricasHeader({
  totalProductos = 0,
  stockTotal = 0,
  pedidosPendientes = 0,
  totalCategorias = 0,
}: MetricasHeaderProps) {
  const metricas = [
    {
      label: "Productos",
      valor: totalProductos,
      icono: Package,
      accent: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
      resaltar: false,
    },
    {
      label: "Unidades en stock",
      valor: stockTotal,
      icono: BarChart3,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
      resaltar: false,
    },
    {
      label: "Pedidos Pendientes",
      valor: pedidosPendientes,
      icono: Clock,
      accent: pedidosPendientes > 0
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
      resaltar: pedidosPendientes > 0,
    },
    {
      label: "Categorías activas",
      valor: totalCategorias,
      icono: Tags,
      accent: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
      resaltar: false,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
      {metricas.map((m) => {
        const Icono = m.icono;
        const valorSeguro = Number.isFinite(m.valor) ? m.valor : 0;

        return (
          <div
            key={m.label}
            className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900/90 p-3.5 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-98 ${
              m.resaltar
                ? "border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/20"
                : "border-slate-200/80 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border text-base transition-transform group-hover:scale-105 ${m.accent}`}
              >
                <Icono className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>

              {/* Indicador pulsante si hay pedidos pendientes pendientes */}
              {m.resaltar && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}
            </div>

            <p className="m-0 text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
              {valorSeguro.toLocaleString()}
            </p>

            <p className="m-0 mt-1 text-[11px] font-semibold leading-tight text-slate-500 dark:text-zinc-400 sm:text-xs">
              {m.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
