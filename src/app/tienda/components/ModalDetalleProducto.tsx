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
  const { agregarAlCarrito } = useCarrito();
  const [cantidad, setCantidad] = useState(1);

  // Reiniciar la cantidad cada vez que cambia el producto
  useEffect(() => {
    setCantidad(1);
  }, [producto]);

  if (!producto) return null;

  const sinStock = (producto.stock ?? 0) <= 0;
  const tieneDescuento =
    Boolean(producto.precio_anterior) &&
    (producto.precio_anterior ?? 0) > producto.precio;

  const handleAgregar = () => {
    if (sinStock) return;
    
    // Agregamos al carrito la cantidad seleccionada
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito({
        ...producto,
        cantidad: 1,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
      {/* Overlay para cerrar al hacer clic afuera */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Contenido del Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F5] text-sm text-[#6B675F] hover:bg-[#E7E5E0] hover:text-[#12151B] transition-colors"
        >
          ✕
        </button>

        {/* Imagen Ampliada */}
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-[#F7F7F5] flex items-center justify-center">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="text-6xl">🛍️</span>
          )}

          {tieneDescuento && (
            <span className="absolute top-3 left-3 z-10 rounded-md bg-[#DC2626] px-2 py-1 text-xs font-bold text-white uppercase tracking-wider shadow">
              Oferta
            </span>
          )}

          {sinStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
              <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[#12151B] shadow">
                Sin Stock Disponible
              </span>
            </div>
          )}
        </div>

        {/* Info y Categoría */}
        <div className="space-y-3">
          {producto.categoria && (
            <span className="inline-block rounded-md bg-[#F7F7F5] px-2.5 py-1 text-[11px] font-semibold text-[#6B675F] uppercase tracking-wider">
              {producto.categoria}
            </span>
          )}

          <h2 className="text-lg sm:text-xl font-bold text-[#12151B] leading-snug">
            {producto.nombre}
          </h2>

          {/* Precios */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#12151B]">
              ${producto.precio.toLocaleString("es-AR")}
            </span>
            {tieneDescuento && (
              <span className="text-sm text-[#A6A29B] line-through">
                ${producto.precio_anterior?.toLocaleString("es-AR")}
              </span>
            )}
          </div>

          {/* Descripción Completa */}
          {producto.descripcion ? (
            <div className="pt-2 border-t border-[#E7E5E0]">
              <h4 className="text-xs font-bold text-[#6B675F] uppercase tracking-wider mb-1">
                Descripción
              </h4>
              <p className="text-sm text-[#6B675F] leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#A6A29B] italic pt-1">
              Sin descripción adicional disponible.
            </p>
          )}

          {/* Selector de Cantidad y Botón de Carrito */}
          <div className="pt-4 border-t border-[#E7E5E0] space-y-3">
            {!sinStock && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#12151B]">
                  Cantidad (Disponible: {producto.stock})
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-[#E7E5E0] bg-[#F7F7F5] p-1">
                  <button
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    disabled={cantidad <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white font-bold text-[#12151B] shadow-sm disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-[#12151B] min-w-[20px] text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad((prev) => Math.min(producto.stock, prev + 1))}
                    disabled={cantidad >= producto.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white font-bold text-[#12151B] shadow-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAgregar}
              disabled={sinStock}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                sinStock
                  ? "bg-[#E7E5E0] text-[#6B675F] cursor-not-allowed"
                  : "bg-[#12151B] text-white hover:bg-[#0E6E55] active:scale-[0.98]"
              }`}
            >
              <span>🛒</span>
              <span>
                {sinStock
                  ? "Producto Agotado"
                  : `Agregar ${cantidad} al Carrito • $${(
                      producto.precio * cantidad
                    ).toLocaleString("es-AR")}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
