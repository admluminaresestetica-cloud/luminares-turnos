'use client';

import React, { useState, useEffect } from "react";
import { Producto } from "@/types/tienda";
import { useCarrito } from "@/context/CarritoContext";

interface ModalDetalleProductoProps {
  producto: Producto | null;
  onClose: () => void;
}

export default function ModalDetalleProducto({
  producto,
  onClose,
}: ModalDetalleProductoProps) {
  const [cantidad, setCantidad] = useState(1);
  const context = useCarrito();
  const agregarAlCarrito = context?.agregarAlCarrito;
  const items = context?.items || context?.carrito || [];

  // Calcular cuántas unidades ya están en el carrito
  const itemEnCarrito = Array.isArray(items) && producto
    ? items.find((item: any) => item.id === producto.id)
    : null;
  const yaEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

  // Stock total real restante para sumar
  const stockTotal = producto?.stock ?? 0;
  const disponibleParaAgregar = Math.max(0, stockTotal - yaEnCarrito);

  // Resetea el contador al abrir o cambiar de producto
  useEffect(() => {
    if (producto) {
      setCantidad(disponibleParaAgregar > 0 ? 1 : 0);
    }
  }, [producto, yaEnCarrito]);

  if (!producto) return null;

  const precioFormateado = new Intl.NumberFormat("es-AR").format(
    producto.precio || 0
  );

  const decrementar = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const incrementar = () => {
    if (cantidad < disponibleParaAgregar) setCantidad(cantidad + 1);
  };

  const handleAgregar = () => {
    if (disponibleParaAgregar > 0 && agregarAlCarrito && cantidad > 0) {
      agregarAlCarrito({
        ...producto,
        cantidad: cantidad,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 transition-opacity">
      <div 
        className="relative w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F5] text-xs font-bold text-[#12151B] transition-colors hover:bg-[#E7E5E0]"
        >
          ✕
        </button>

        {/* Imagen */}
        <div className="mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-[#F7F7F5] flex items-center justify-center">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl">🛍️</span>
          )}
        </div>

        {/* Categoria & Nombre */}
        {producto.categoria && (
          <span className="inline-block rounded-full bg-[#F7F7F5] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#6B675F] uppercase mb-1">
            {producto.categoria}
          </span>
        )}
        <h2 className="text-xl font-bold text-[#12151B] leading-snug">
          {producto.nombre}
        </h2>
        <p className="mt-1 text-2xl font-extrabold text-[#12151B]">
          ${precioFormateado}
        </p>

        {/* Descripción */}
        {producto.descripcion && (
          <div className="mt-4 border-t border-[#E7E5E0] pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6A29B]">
              Descripción
            </h4>
            <p className="mt-1 text-xs text-[#6B675F] leading-relaxed">
              {producto.descripcion}
            </p>
          </div>
        )}

        {/* Selector de cantidad y Stock */}
        <div className="mt-6 border-t border-[#E7E5E0] pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-[#12151B]">
                Disponible para agregar: {disponibleParaAgregar}
              </p>
              {yaEnCarrito > 0 && (
                <p className="text-[11px] font-bold text-[#0E6E55] mt-0.5">
                  (Ya tenés {yaEnCarrito} en tu carrito)
                </p>
              )}
            </div>

            {/* Selector - / + */}
            <div className="flex items-center gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-1">
              <button
                onClick={decrementar}
                disabled={cantidad <= 1 || disponibleParaAgregar === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold">
                {disponibleParaAgregar === 0 ? 0 : cantidad}
              </span>
              <button
                onClick={incrementar}
                disabled={cantidad >= disponibleParaAgregar || disponibleParaAgregar === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Botón de Confirmación */}
          <button
            onClick={handleAgregar}
            disabled={disponibleParaAgregar === 0}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              disponibleParaAgregar === 0
                ? "bg-[#E7E5E0] text-[#6B675F] cursor-not-allowed opacity-80"
                : "bg-[#12151B] text-white hover:bg-[#0E6E55] active:scale-[0.98]"
            }`}
          >
            <span>🛒</span>
            <span>
              {disponibleParaAgregar === 0
                ? "Máximo disponible alcanzado"
                : `Agregar ${cantidad} al Carrito • $${new Intl.NumberFormat(
                    "es-AR"
                  ).format((producto.precio || 0) * cantidad)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
