'use client';

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";

const MONTO_ENVIO_GRATIS = 25000;

interface BotonFlotanteCarritoProps {
  onOpenCarrito: () => void;
}

export default function BotonFlotanteCarrito({ onOpenCarrito }: BotonFlotanteCarritoProps) {
  const context = useCarrito();
  const items = context?.items || context?.carrito || [];

  const totalItems = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.cantidad) || 1), 0)
    : 0;

  // Si no hay productos en el carrito, no renderiza nada
  if (totalItems === 0) return null;

  const totalPrecio = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.precio) || 0) * (Number(item?.cantidad) || 1), 0)
    : 0;

  const faltaParaEnvioGratis = Math.max(0, MONTO_ENVIO_GRATIS - totalPrecio);
  const porcentajeProgreso = Math.min(100, (totalPrecio / MONTO_ENVIO_GRATIS) * 100);
  const tieneEnvioGratis = totalPrecio >= MONTO_ENVIO_GRATIS;

  return (
    <div className="fixed bottom-5 right-4 left-4 z-40 sm:hidden animate-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={onOpenCarrito}
        className="flex w-full flex-col overflow-hidden rounded-2xl bg-[#12151B]/95 p-3.5 text-white shadow-2xl backdrop-blur-md active:scale-95 transition-all duration-200 cursor-pointer border border-white/10"
      >
        {/* Texto de estado de Envío Gratis */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1 w-full px-0.5">
          {tieneEnvioGratis ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
               ¡Tenés ENVÍO GRATIS!
            </span>
          ) : (
            <span>
              Te faltan <strong className="text-white">${faltaParaEnvioGratis.toLocaleString("es-AR")}</strong> para envío gratis
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-bold">{Math.round(porcentajeProgreso)}%</span>
        </div>

        {/* Mini barra de progreso */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15 mb-2.5">
          <div
            className="h-full bg-[#0E6E55] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${porcentajeProgreso}%` }}
          />
        </div>

        {/* Fila principal de datos del carrito */}
        <div className="flex w-full items-center justify-between font-bold text-sm pt-1 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-[#0E6E55]">
              <ShoppingBag className="h-3.5 w-3.5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-[#12151B]">
                {totalItems}
              </span>
            </div>
            <span className="font-semibold tracking-wide text-xs">Ver Mi Carrito</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">
              ${totalPrecio.toLocaleString("es-AR")}
            </span>
            <span className="text-emerald-400 text-xs">→</span>
          </div>
        </div>
      </button>
    </div>
  );
}