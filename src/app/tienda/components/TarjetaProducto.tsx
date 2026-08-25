'use client';

import React from "react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";

interface TarjetaProductoProps {
  producto: Producto;
  onVerDetalle?: (producto: Producto) => void;
}

export default function TarjetaProducto({
  producto,
  onVerDetalle,
}: TarjetaProductoProps) {
  const { agregarAlCarrito } = useCarrito();
  const sinStock = (producto.stock ?? 0) <= 0;

  return (
    <div
      onClick={() => onVerDetalle && onVerDetalle(producto)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white p-2.5 sm:p-3.5 shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      {/* Imagen del Producto */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-[#F7F7F5] flex items-center justify-center">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}

        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] sm:text-[11px] font-bold text-[#12151B]">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Información del Producto */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-[#12151B] leading-snug">
            {producto.nombre}
          </h3>
        </div>

        {/* Precios y Stock */}
        <div className="mt-2 mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-bold text-[#12151B]">
              ${producto.precio.toLocaleString("es-AR")}
            </span>
          </div>
          <p className="text-[10px] text-[#A6A29B] mt-0.5">
            Stock: {producto.stock}
          </p>
        </div>

        {/* Botón rápido de agregar al carrito */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita abrir el modal al tocar el botón
            if (!sinStock) {
              agregarAlCarrito({
                ...producto,
                cantidad: 1,
              });
            }
          }}
          disabled={sinStock}
          className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            sinStock
              ? "bg-[#E7E5E0] text-[#6B675F] cursor-not-allowed"
              : "bg-[#12151B] text-white hover:bg-[#0E6E55] active:scale-[0.97]"
          }`}
        >
          <span>🛒</span>
          <span>{sinStock ? "Agotado" : "Agregar"}</span>
        </button>
      </div>
    </div>
  );
}
