'use client';

import React from "react";
import { CheckCircle2, PackageSearch } from "lucide-react";
import Link from "next/link";

interface ModalExitoProps {
  mostrar: boolean;
  onAceptar: () => void;
  esMercadoPago?: boolean;
  codigoPedido?: string;
  totalAbonado?: number;
}

export default function ModalExito({
  mostrar,
  onAceptar,
  esMercadoPago = false,
  codigoPedido,
  totalAbonado,
}: ModalExitoProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0F14]/60 p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(11,15,20,0.25)] animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">

        {/* Encabezado del Ticket */}
        <div className="flex flex-col items-center bg-[#F7F7F5] px-6 pb-5 pt-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E6E55]/10">
            <CheckCircle2 className="h-8 w-8 text-[#0E6E55]" strokeWidth={1.8} />
          </div>
          <h3 className="mt-3 text-lg font-bold text-[#12151B]">
            {esMercadoPago ? "¡Pago Aprobado! 🎉" : "¡Pedido Recibido!"}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#6B675F]">
            {esMercadoPago
              ? "Tu pago a través de Mercado Pago se procesó con éxito."
              : "Tu pedido fue registrado correctamente."}
          </p>

          {/* Tarjeta con el Código de Seguimiento */}
          {codigoPedido && (
            <div className="mt-4 w-full rounded-2xl bg-white border border-[#E7E5E0] p-3 text-center shadow-2xs">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Código de seguimiento
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono tracking-wider">
                #{codigoPedido.toUpperCase()}
              </span>
              {totalAbonado ? (
                <p className="mt-1 text-xs font-semibold text-foreground">
                  Total abonado: ${totalAbonado.toLocaleString('es-AR')}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Línea troquelada estilo ticket */}
        <div className="relative flex items-center px-6">
          <div className="h-4 w-4 -translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute left-0" />
          <div className="h-4 w-4 translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute right-0" />
          <div className="w-full border-t border-dashed border-[#E7E5E0]" />
        </div>

        {/* Botones de Acción */}
        <div className="px-6 pb-6 pt-4 space-y-2">
          {/* Botón ir a Seguimiento */}
          <Link
            href="/seguimiento"
            onClick={onAceptar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] py-3 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#1E222B] active:scale-[0.98]"
          >
            <PackageSearch className="w-4 h-4 text-emerald-400" />
            <span>Rastrear mi pedido</span>
          </Link>

          {/* Botón Continuar en la tienda */}
          <button
            onClick={onAceptar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted/60 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
          >
            <span>Volver a la tienda</span>
          </button>
        </div>

      </div>
    </div>
  );
}