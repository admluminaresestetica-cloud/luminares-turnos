// tienda/components/GridProductos.tsx
"use client";

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
        {[...Array(8)].map((_, i) => (
          <ProductoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xs py-16 px-4 text-center shadow-xs animate-in fade-in duration-300">
        <span className="text-4xl block select-none">📦</span>
        <p className="mt-4 text-sm sm:text-base font-medium text-muted-foreground max-w-sm mx-auto">
          No se encontraron productos disponibles con esos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 animate-in fade-in duration-300">
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