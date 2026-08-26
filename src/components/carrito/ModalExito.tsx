'use client';

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ModalExitoProps {
  mostrar: boolean;
  onAceptar: () => void;
  esMercadoPago?: boolean; // Nueva prop opcional
}

export default function ModalExito({ mostrar, onAceptar, esMercadoPago = false }: ModalExitoProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0F14]/60 p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(11,15,20,0.25)] animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">

        {/* Encabezado tipo ticket */}
        <div className="flex flex-col items-center bg-[#F7F7F5] px-6 pb-6 pt-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0E6E55]/10">
            <CheckCircle2 className="h-9 w-9 text-[#0E6E55]" strokeWidth={1.8} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#12151B]">
            {esMercadoPago ? "¡Pago aprobado! 🎉" : "¡Pedido enviado!"}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B675F]">
            {esMercadoPago
              ? "Tu pago a través de Mercado Pago se procesó correctamente y ya registramos tu pedido."
              : "Tu pedido fue registrado con éxito y te redirigimos a WhatsApp para confirmarlo."}
          </p>
        </div>

        {/* Línea de recorte tipo ticket */}
        <div className="relative flex items-center px-6">
          <div className="h-4 w-4 -translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute left-0" />
          <div className="h-4 w-4 translate-x-1/2 rounded-full bg-[#0B0F14]/60 absolute right-0" />
          <div className="w-full border-t border-dashed border-[#E7E5E0]" />
        </div>

        {/* Acción */}
        <div className="px-6 pb-6 pt-5">
          <button
            onClick={onAceptar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12151B] py-3.5 text-[15px] font-bold text-white shadow-md shadow-[#12151B]/20 transition-all duration-200 hover:bg-[#1E222B] active:scale-[0.98]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}