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
  // 1. Si está cargando, mostramos los skeletons modularizados
  if (cargando) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {[...Array(8)].map((_, i) => (
          <ProductoSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 2. Si ya cargó pero no hay productos
  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E5E0] bg-white py-16 text-center">
        <span className="text-4xl">📦</span>
        <p className="mt-4 text-[15px] font-medium text-[#6B675F]">
          No se encontraron productos disponibles con esos filtros.
        </p>
      </div>
    );
  }

  // 3. Render normal de productos
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