'use client';

import React from 'react';
import { Producto } from '@/types/tienda';
import { useCarrito } from '@/context/CarritoContext';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { carrito, agregarAlCarrito, restarUnidad } = useCarrito();

  const itemEnCarrito = carrito.find((item) => item.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  const stockDisponible = producto.stock ?? 0;
  const estaPausado = producto.activo === false;
  const sinStock = stockDisponible <= 0 || estaPausado;
  const alcanzoLimiteStock = cantidadEnCarrito >= stockDisponible;

  // WhatsApp para consulta de reingreso
  const numeroTelefono = "5493413954355";
  const mensajeWA = encodeURIComponent(
    `¡Hola! Quería consultar cuándo vuelve a ingresar el producto: ${producto.nombre}`
  );
  const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeWA}`;

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#12151B]/30 hover:shadow-md"
      style={{ opacity: sinStock ? 0.75 : 1 }}
    >
      <div>
        {/* Badge de estado sin stock / pausado */}
        {sinStock && (
          <span className="absolute top-3 right-3 z-10 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            {estaPausado ? 'No disponible' : 'Sin Stock'}
          </span>
        )}

        {/* Contenedor de Imagen */}
        <div className="relative mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F5] sm:h-40">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-3xl text-gray-300">🧴</span>
          )}
        </div>

        {/* Información del producto */}
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-[#12151B] min-h-[2.5rem]">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="line-clamp-2 mt-1 text-xs text-gray-500 min-h-[2rem]">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-base font-extrabold text-[#12151B] sm:text-lg">
            ${new Intl.NumberFormat("es-AR").format(producto.precio)}
          </span>
          <span className="text-[11px] font-medium text-gray-500">
            Stock: {stockDisponible}
          </span>
        </div>
      </div>

      {/* Acciones y control de cantidad */}
      <div className="mt-3">
        {sinStock ? (
          estaPausado ? (
            <button
              disabled
              className="w-full rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-400 cursor-not-allowed"
            >
              Pausado
            </button>
          ) : (
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-xs transition-transform active:scale-[0.98] hover:bg-[#20bd5a]"
            >
              Consultar Reingreso 💬
            </a>
          )
        ) : cantidadEnCarrito > 0 ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between rounded-xl border border-[#12151B] bg-[#F7F7F5] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => restarUnidad(producto.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[#12151B] shadow-2xs transition-all hover:bg-gray-100 active:scale-95"
                title="Restar una unidad"
              >
                -
              </button>

              <span className="text-xs font-bold text-[#12151B] select-none">
                {cantidadEnCarrito} en carrito
              </span>

              <button
                type="button"
                onClick={() => agregarAlCarrito(producto)}
                disabled={alcanzoLimiteStock}
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold shadow-2xs transition-all active:scale-95 ${
                  alcanzoLimiteStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
                    : "bg-[#12151B] text-white hover:bg-black"
                }`}
                title={alcanzoLimiteStock ? "Stock máximo alcanzado" : "Sumar una unidad"}
              >
                +
              </button>
            </div>

            {alcanzoLimiteStock && (
              <span className="text-[10px] text-center font-medium text-amber-600 mt-0.5">
                Máximo disponible reached
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => agregarAlCarrito(producto)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-black active:scale-[0.98]"
          >
            🛒 Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  );
}