'use client';

import React from "react";
import { Producto } from "@/types/tienda";
import TarjetaProducto from "./TarjetaProducto";
import ProductoSkeleton from "./ProductoSkeleton";
import { Flame, Sparkles } from "lucide-react";

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
      <div className="rounded-2xl border border-[#E7E5E0] dark:border-zinc-800 bg-white dark:bg-zinc-900 py-16 text-center">
        <span className="text-4xl">📦</span>
        <p className="mt-4 text-[15px] font-medium text-[#6B675F] dark:text-zinc-400">
          No se encontraron productos disponibles con esos filtros.
        </p>
      </div>
    );
  }

  // Filtrar productos con descuento para el bloque de ofertas
  const productosOferta = productos.filter((p) => {
    const precioOriginal = Number(p.precio_original) || 0;
    return precioOriginal > p.precio;
  });

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: CARRUSEL HORIZONTAL DE OFERTAS (Se muestra solo si hay productos con descuento) */}
      {productosOferta.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Ofertas Imperdibles
            </h3>
          </div>

          <div className="no-scrollbar flex w-full items-stretch gap-3 overflow-x-auto scroll-smooth pb-2 pt-1">
            {productosOferta.map((producto) => (
              <div key={`oferta-${producto.id}`} className="w-[180px] sm:w-[220px] shrink-0">
                <TarjetaProducto
                  producto={producto}
                  onVerDetalle={onVerDetalle}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN 2: CATÁLOGO COMPLETO */}
      <section className="space-y-3">
        {productosOferta.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55] dark:bg-emerald-500/20 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Todos los productos
            </h3>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {productos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onVerDetalle={onVerDetalle}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
