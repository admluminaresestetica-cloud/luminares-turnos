'use client';

import React from "react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";
import { Plus, Minus } from "lucide-react";

interface TarjetaProductoProps {
  producto: Producto;
  onVerDetalle?: (producto: Producto) => void;
}

export default function TarjetaProducto({
  producto,
  onVerDetalle,
}: TarjetaProductoProps) {
  const context = useCarrito();
  const agregarAlCarrito = context?.agregarAlCarrito;
  const actualizarCantidad = (context as any)?.actualizarCantidad;
  const eliminarDelCarrito = (context as any)?.eliminarDelCarrito;
  const items = context?.items || context?.carrito || [];

  const stockDisponible = producto.stock ?? 0;
  const sinStock = stockDisponible <= 0;

  const itemEnCarrito = Array.isArray(items) 
    ? items.find((item: any) => item.id === producto.id) 
    : null;
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Verificamos si alcanzó el límite del stock
  const limiteAlcanzado = cantidadEnCarrito >= stockDisponible;

  const precioFormateado = new Intl.NumberFormat("es-AR").format(
    producto.precio || 0
  );

  const precioBaseNum = Number(producto.precio_original ?? producto.precio_anterior) || 0;
  const tieneOferta = precioBaseNum > producto.precio;

  const porcentajeDescuento = tieneOferta
    ? Math.round(((precioBaseNum - producto.precio) / precioBaseNum) * 100)
    : 0;

  const precioOriginalFormateado = tieneOferta
    ? new Intl.NumberFormat("es-AR").format(precioBaseNum)
    : null;

<<<<<<< HEAD
  // Handlers para sumar y restar desde la tarjeta
=======
  // Handler para restar 1 unidad o eliminar si llega a 0
>>>>>>> actualizacion-interfaz-tienda
  const handleRestar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cantidadEnCarrito > 1 && actualizarCantidad) {
      actualizarCantidad(producto.id, cantidadEnCarrito - 1);
    } else if (eliminarDelCarrito) {
      eliminarDelCarrito(producto.id);
    } else if (actualizarCantidad) {
      actualizarCantidad(producto.id, 0);
    }
  };

<<<<<<< HEAD
=======
  // Handler para sumar 1 unidad hasta el stock límite
>>>>>>> actualizacion-interfaz-tienda
  const handleSumar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!limiteAlcanzado) {
      if (cantidadEnCarrito > 0 && actualizarCantidad) {
        actualizarCantidad(producto.id, cantidadEnCarrito + 1);
      } else if (agregarAlCarrito) {
<<<<<<< HEAD
        agregarAlCarrito(producto);
=======
        (agregarAlCarrito as any)({
          ...producto,
          cantidad: 1,
        });
>>>>>>> actualizacion-interfaz-tienda
      }
    }
  };

  return (
    <div
      onClick={() => onVerDetalle && onVerDetalle(producto)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E7E5E0] bg-white p-2.5 sm:p-3.5 shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      {/* Imagen del Producto */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-[#F7F7F5] flex items-center justify-center">
        
        {/* Badge: 🔥 ¡Últimas unidades! */}
        {producto.mostrar_ultimas_unidades && !sinStock && (
          <span className="absolute top-2 left-2 z-20 rounded-md bg-[#D97706] px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white shadow-sm">
            🔥 ¡Últimas unidades!
          </span>
        )}

        {/* Badge: Porcentaje OFF */}
        {tieneOferta && !sinStock && (
          <span className="absolute top-2 right-2 z-20 rounded-md bg-[#0E6E55] px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white shadow-sm">
            {porcentajeDescuento}% OFF
          </span>
        )}

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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
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
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[#12151B]">
              ${precioFormateado}
            </span>
            {tieneOferta && (
              <span className="text-xs text-[#A6A29B] line-through">
                ${precioOriginalFormateado}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#A6A29B] mt-0.5">
            Stock: {producto.stock}
          </p>
        </div>

<<<<<<< HEAD
        {/* Botón Adaptativo / Control - y + */}
=======
        {/* Controles de Botón Adaptativo */}
>>>>>>> actualizacion-interfaz-tienda
        {sinStock ? (
          <button
            disabled
            className="w-full py-2 px-2 rounded-xl text-xs font-bold bg-[#E7E5E0] text-[#6B675F] cursor-not-allowed opacity-80"
          >
            Agotado
          </button>
        ) : cantidadEnCarrito === 0 ? (
          <button
            onClick={handleSumar}
            className="w-full py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#12151B] text-white hover:bg-[#0E6E55] active:scale-[0.97]"
          >
            <span>🛒</span>
            <span>Agregar</span>
          </button>
        ) : (
<<<<<<< HEAD
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between w-full rounded-xl border border-[#0E6E55]/30 bg-[#0E6E55]/5 p-1"
          >
            {/* Botón Restar */}
            <button
              onClick={handleRestar}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#0E6E55] shadow-sm hover:bg-[#0E6E55] hover:text-white transition-all cursor-pointer"
              title="Restar una unidad"
            >
              <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>

            {/* Cantidad Actual */}
            <span className="text-xs font-extrabold text-[#0E6E55] px-1">
              {cantidadEnCarrito} en carrito
            </span>

            {/* Botón Sumar */}
            <button
              onClick={handleSumar}
              disabled={limiteAlcanzado}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                limiteAlcanzado
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#0E6E55] text-white hover:bg-[#0b5944] cursor-pointer shadow-sm"
              }`}
              title={limiteAlcanzado ? "Stock máximo alcanzado" : "Sumar una unidad"}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
=======
          <div className="flex items-center justify-between w-full bg-[#F7F7F5] border border-[#E7E5E0] rounded-xl p-1">
            <button
              onClick={handleRestar}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#12151B] shadow-sm hover:bg-gray-100 active:scale-95 transition-all"
              title="Restar una unidad"
            >
              −
            </button>

            <span className="text-xs font-extrabold text-[#12151B] px-2">
              {cantidadEnCarrito}
            </span>

            <button
              onClick={handleSumar}
              disabled={limiteAlcanzado}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold shadow-sm transition-all ${
                limiteAlcanzado
                  ? "bg-[#E7E5E0] text-[#A6A29B] cursor-not-allowed"
                  : "bg-[#12151B] text-white hover:bg-[#0E6E55] active:scale-95"
              }`}
              title={limiteAlcanzado ? "Stock máximo alcanzado" : "Sumar una unidad"}
            >
              +
>>>>>>> actualizacion-interfaz-tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}