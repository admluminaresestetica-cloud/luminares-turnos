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
    <div className="relative flex flex-col justify-between rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-sm transition-all hover:border-[#12151B]/20">
      {/* Badge de Descuento con solapa doblada exacto */}
      {tieneDescuento && (
        <div className="absolute top-4 left-0 z-10">
          <span className="bg-[#E54D42] text-white text-xs font-bold px-2.5 py-1 rounded-r-md shadow-sm inline-block">
            -{porcentajeDescuento}%
          </span>
        </div>
      )}

      <div>
        {/* Contenedor de Imagen Limpia sin fondo */}
        {producto.imagen_url && (
          <div className="relative mb-3 flex h-52 w-full items-center justify-center">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        <h3 className="m-0 text-base font-bold text-[#12151B]">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="mt-1 mb-4 text-xs text-[#6B675F] line-clamp-2 leading-relaxed">
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

        {/* Botón de acción con el tono verde/azul oscuro original */}
        {cantidad === 0 ? (
          <button
            onClick={() => agregarAlCarrito(producto)}
            className="w-full rounded-2xl bg-[#0F4C42] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A3730]"
          >
            Agregar al carrito
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-[#E7E5E0] bg-[#F7F7F5] p-1.5">
            <button
              onClick={() => restarUnidad(producto.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-[#12151B] shadow-sm hover:bg-gray-100"
            >
              -
            </button>
            <span className="font-bold text-[#12151B] text-sm">
              {cantidad}
            </span>
            <button
              onClick={() => agregarAlCarrito(producto)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-[#12151B] shadow-sm hover:bg-gray-100"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
