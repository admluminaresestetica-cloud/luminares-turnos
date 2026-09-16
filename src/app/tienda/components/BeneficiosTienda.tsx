'use client';

import React from "react";
import { Truck, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

export default function BeneficiosTienda() {
  const { config } = useConfig();

  const rawNumber = config?.whatsapp_numero || "5493413954355";
  const numeroTelefono = rawNumber.replace(/[^0-9]/g, "");
  const urlWhatsApp = `https://wa.me/${numeroTelefono}`;

  const beneficios = [
    {
      icon: Truck,
      titulo: "Envíos a domicilio",
      sub: "En toda la zona",
    },
    {
      icon: ShieldCheck,
      titulo: "Pagos seguros",
      sub: "Datos protegidos",
    },
    {
      icon: CreditCard,
      titulo: "Cuotas / Transferencia",
      sub: "Elegí cómo pagar",
    },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar mb-4">
      <div className="flex items-stretch gap-2.5 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
        {beneficios.map(({ icon: Icon, titulo, sub }) => (
          <div
            key={titulo}
            className="flex items-center gap-2.5 rounded-2xl border border-[#E7E5E0] bg-white px-3.5 py-3 shrink-0 w-[190px] sm:w-auto shadow-xs"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0E6E55]/10 text-[#0E6E55]">
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold text-[#12151B] truncate">{titulo}</p>
              <p className="m-0 text-[10px] text-[#9E9A92] truncate">{sub}</p>
            </div>
          </div>
        ))}

        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 px-3.5 py-3 shrink-0 w-[190px] sm:w-auto shadow-xs transition-all active:scale-95 hover:bg-[#25D366]/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C4A]">
            <MessageCircle className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-xs font-bold text-[#12151B] truncate">Atención por WhatsApp</p>
            <p className="m-0 text-[10px] text-[#9E9A92] truncate">Escribinos ahora</p>
          </div>
        </a>
      </div>
    </div>
  );
}