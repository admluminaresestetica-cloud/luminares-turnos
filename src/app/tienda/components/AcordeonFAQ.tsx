"use client";

import { useState } from "react";
import { ChevronDown, Truck, CreditCard, RefreshCw } from "lucide-react";

export default function AcordeonFAQ() {
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null);

  const toggleFaq = (seccion: string) => {
    setFaqAbierta(faqAbierta === seccion ? null : seccion);
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6 space-y-2">
      {/* Envíos */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
        <button
          onClick={() => toggleFaq("envios")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Truck className="h-4 w-4 text-[#0E6E55]" />
            <span>Envíos y Entregas</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              faqAbierta === "envios" ? "rotate-180" : ""
            }`}
          />
        </button>
        {faqAbierta === "envios" && (
          <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white">
            Coordinamos los envíos directamente por WhatsApp una vez realizado el pedido. Hacemos entregas locales y envíos a zonas cercanas.
          </div>
        )}
      </div>

      {/* Medios de Pago */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
        <button
          onClick={() => toggleFaq("pagos")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 text-[#0E6E55]" />
            <span>Medios de Pago</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              faqAbierta === "pagos" ? "rotate-180" : ""
            }`}
          />
        </button>
        {faqAbierta === "pagos" && (
          <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white">
            Aceptamos transferencia bancaria, Mercado Pago y efectivo al momento de la entrega o retiro en local.
          </div>
        )}
      </div>

      {/* Políticas de Cambio */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
        <button
          onClick={() => toggleFaq("cambios")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-4 w-4 text-[#0E6E55]" />
            <span>Políticas de Cambio y Devolución</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              faqAbierta === "cambios" ? "rotate-180" : ""
            }`}
          />
        </button>
        {faqAbierta === "cambios" && (
          <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white">
            Por razones de higiene y seguridad en productos de perfumería, cosmética y pañalería, los cambios se realizan exclusivamente si el producto conserva su empaque original sellado y sin uso.
          </div>
        )}
      </div>
    </div>
  );
}
