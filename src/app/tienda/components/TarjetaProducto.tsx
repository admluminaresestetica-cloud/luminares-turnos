'use client';

import React from 'react';
import { Producto } from '@/types/tienda';

interface TarjetaProductoProps {
  producto: Producto;
  onAgregarAlCarrito: (producto: Producto) => void;
  onVerDetalle: (producto: Producto) => void;
}

export default function TarjetaProducto({
  producto,
  onAgregarAlCarrito,
  onVerDetalle,
}: TarjetaProductoProps) {
  const sinStock = (producto.stock ?? 0) <= 0;
  const tieneDescuento =
    Boolean(producto.precio_anterior) &&
    (producto.precio_anterior ?? 0) > producto.precio;

  return (
    <div
      onClick={() => onVerDetalle(producto)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      {/* Badge de Descuento u Oferta */}
      {tieneDescuento && (
        <span className="absolute top-2 left-2 z-10 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
          Oferta
        </span>
      )}

      {/* Imagen del Producto */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
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
            <span className="rounded-md bg-white/90 px-2 py-1 text-[10px] sm:text-[11px] font-bold text-gray-800 shadow">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Info del Producto */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {producto.categoria && (
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {producto.categoria}
            </p>
          )}

          <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-gray-800 leading-snug">
            {producto.nombre}
          </h3>
        </div>

        {/* Precios y Stock */}
        <div className="mt-2 mb-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              ${producto.precio.toLocaleString('es-AR')}
            </span>
            {tieneDescuento && (
              <span className="text-[11px] text-gray-400 line-through">
                ${producto.precio_anterior?.toLocaleString('es-AR')}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Stock: {producto.stock}
          </p>
        </div>

        {/* Botón Acción Rápida */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!sinStock) onAgregarAlCarrito(producto);
          }}
          disabled={sinStock}
          className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            sinStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-emerald-600 active:scale-[0.97]'
          }`}
        >
          <span>🛒</span>
          <span>{sinStock ? 'Agotado' : 'Agregar'}</span>
        </button>
      </div>
    </div>
  );
}
