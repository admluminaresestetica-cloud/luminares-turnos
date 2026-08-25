'use client';

import React from "react";

interface CarritoItemProps {
  item: {
    id: string | number;
    nombre: string;
    precio: number;
    cantidad: number;
    stock?: number;
    imagen_url?: string;
  };
  onRestar: (id: string | number) => void;
  onAgregar: (item: any) => void;
  onEliminar: (id: string | number) => void;
}

export default function CarritoItem({
  item,
  onRestar,
  onAgregar,
  onEliminar,
}: CarritoItemProps) {
  const stockDisponible = item.stock ?? 0;
  const alcanzoLimite = item.cantidad >= stockDisponible;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7E5E0] bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E5E0] bg-[#F7F7F5]">
          {item.imagen_url ? (
            <img
              src={item.imagen_url}
              alt={item.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl">🛍️</span>
          )}
        </div>

        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold text-[#12151B]">
            {item.nombre}
          </strong>
          <span className="text-xs font-bold text-[#0E6E55]">
            ${new Intl.NumberFormat("es-AR").format(item.precio)}
          </span>
          <span className="ml-1 text-xs text-gray-400">c/u</span>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-0.5 rounded-full border border-[#E7E5E0] bg-[#F7F7F5] p-0.5">
          <button
            onClick={() => onRestar(item.id)}
            aria-label="Quitar unidad"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#12151B] shadow-sm transition-transform hover:bg-white active:scale-90"
          >
            −
          </button>
          <span className="min-w-[22px] text-center text-sm font-bold text-[#12151B]">
            {item.cantidad}
          </span>
          <button
            onClick={() => onAgregar(item)}
            disabled={alcanzoLimite}
            aria-label="Agregar unidad"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#12151B] shadow-sm transition-transform enabled:hover:bg-white enabled:active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onEliminar(item.id)}
          className="text-[11px] font-medium text-gray-400 transition-colors hover:text-red-500"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
