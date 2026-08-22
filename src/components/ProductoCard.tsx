"use client";

import React from "react";
import { useCarrito } from "@/context/CarritoContext";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precio_original?: number;
  descripcion?: string;
  imagen_url?: string;
  categoria?: string;
  stock?: number;
  disponible?: boolean;
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Cálculo de porcentaje de descuento
  const tieneDescuento =
    producto.precio_original && producto.precio_original > producto.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(
        ((producto.precio_original! - producto.precio) /
          producto.precio_original!) *
          100
      )
    : 0;

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-[#E7E5E0] bg-white p-5 transition-all hover:border-[#12151B]/20 hover:shadow-lg">
      {/* Badge de Descuento */}
      {tieneDescuento && (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#E54D42] px-2 py-1 text-xs font-bold text-white shadow-sm">
          -{porcentajeDescuento}%
        </span>
      )}

      <div>
        {/* Contenedor de Imagen adaptada */}
        {producto.imagen_url && (
          <div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>
        )}

        <h3 className="m-0 text-base font-bold text-[#12151B]">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="mb-4 mt-1 text-xs text-[#6B675F] line-clamp-2">
            {producto.descripcion}
          </p>
        )}
      </div>

      <div>
        {/* Precios */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-[#12151B]">
            ${producto.precio}
          </span>
          {producto.precio_original && (
            <span className="text-sm font-medium text-[#A6A29B] line-through">
              ${producto.precio_original}
            </span>
          )}
        </div>

        {/* Botones de acción */}
        {cantidad === 0 ? (
          <button
            onClick={() => agregarAlCarrito(producto)}
            className="w-full rounded-xl bg-[#0E6E55] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A5340]"
          >
            Agregar al carrito
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-1.5">
            <button
              onClick={() => restarUnidad(producto.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[#12151B] shadow-sm hover:bg-gray-100"
            >
              -
            </button>
            <span className="font-bold text-[#12151B] text-sm">
              {cantidad}
            </span>
            <button
              onClick={() => agregarAlCarrito(producto)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[#12151B] shadow-sm hover:bg-gray-100"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
