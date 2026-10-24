// tienda/components/GridProductos.tsx
'use client';

import React from "react";
import { Producto } from "@/types/tienda";
import TarjetaProducto from "./TarjetaProducto";
import ProductoSkeleton from "./ProductoSkeleton";

interface GridProductosProps {
  productos: Producto[];
  onVerDetalle?: (producto: Producto) => void;
  cargando?: boolean;
}

export default function GridProductos({
  productos,
  onVerDetalle,
  cargando = false,
}: GridProductosProps) {
  if (cargando) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 sm:p-4 space-y-3 animate-pulse shadow-2xs"
          >
            <div className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-zinc-800" />
            <div className="h-3.5 w-3/4 rounded-lg bg-slate-100 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 rounded-lg bg-slate-100 dark:bg-zinc-800" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-1/3 rounded-lg bg-slate-100 dark:bg-zinc-800" />
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  {/* Estado Sin Resultados */}
  if (!productos || productos.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-16 text-center shadow-xs">
        <span className="text-4xl">📦</span>
        <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">
          No se encontraron productos disponibles con esos filtros.
        </p>
      </div>
    );
  }

  {/* Grilla Principal de Productos */}
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto.id}
          producto={producto}
          onVerDetalle={onVerDetalle}
        />
      ))}
    </div>
  );
}