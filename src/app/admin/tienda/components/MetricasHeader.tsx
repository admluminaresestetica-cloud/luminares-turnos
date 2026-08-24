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
    { label: "Productos", valor: totalProductos, icono: "📦" },
    { label: "Unidades en stock", valor: stockTotal, icono: "📊" },
    { label: "Pedidos Pendientes", valor: pedidosPendientes, icono: "⏳" },
    { label: "Categorías activas", valor: totalCategorias, icono: "🏷️" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metricas.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border-[#E7E5E0] bg-white p-4 transition-shadow hover:shadow-[0_10px_25px_-12px_rgba(11,15,20,0.15)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg">{m.icono}</span>
          </div>
          <p className="m-0 text-2xl font-bold text-[#12151B]">{m.valor}</p>
          <p className="m-0 mt-1 text-xs font-medium text-[#6B675F]">{m.label}</p>
        </div>
      ))}
    </div>
  );
}