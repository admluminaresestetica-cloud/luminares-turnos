'use client';

import React from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCarrito } from "@/context/CarritoContext";

const MONTO_ENVIO_GRATIS = 35000;

interface BotonFlotanteCarritoProps {
  onOpenCarrito: () => void;
}

export default function BotonFlotanteCarrito({ onOpenCarrito }: BotonFlotanteCarritoProps) {
  const context = useCarrito();
  const items = context?.items || context?.carrito || [];

  const totalItems = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.cantidad) || 1), 0)
    : 0;

  if (totalItems === 0) return null;

  const totalPrecio = Array.isArray(items)
    ? items.reduce((acc: number, item: any) => acc + (Number(item?.precio) || 0) * (Number(item?.cantidad) || 1), 0)
    : 0;

  const faltaParaEnvioGratis = Math.max(0, MONTO_ENVIO_GRATIS - totalPrecio);
  const tieneEnvioGratis = totalPrecio >= MONTO_ENVIO_GRATIS;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onOpenCarrito}
        className="flex w-full items-center justify-between rounded-2xl bg-[#12151B] px-4 py-3 text-white shadow-xl shadow-black/20 backdrop-blur-md active:scale-95 transition-all duration-200 cursor-pointer border border-white/10"
      >
        {/* Lado izquierdo: Ícono con contador y texto explicativo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0E6E55]">
            <ShoppingBag className="h-5 w-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-[#12151B] shadow-sm">
              {totalItems}
            </span>
          </div>

          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-white tracking-wide">
              Ver Mi Carrito ({totalItems} {totalItems === 1 ? 'prod.' : 'prods.'})
            </span>
            <span className="text-[10px] font-medium text-slate-300 truncate">
              {tieneEnvioGratis ? (
                <span className="text-emerald-400 font-bold">✨ ¡Envío gratis conseguido!</span>
              ) : (
                <span>Faltan <strong className="text-white">${faltaParaEnvioGratis.toLocaleString("es-AR")}</strong> para envío gratis</span>
              )}
            </span>
          </div>
        </div>

        {/* Lado derecho: Precio total y flecha */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          <span className="text-sm font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ${totalPrecio.toLocaleString("es-AR")}
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
      </button>
    </div>
  );
}
