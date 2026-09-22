"use client";

import { useState } from "react";
import { ChevronDown, Truck, CreditCard, RefreshCw } from "lucide-react";

interface FAQItem {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "envios",
    title: "Envíos y Entregas",
    icon: Truck,
    content:
      "Coordinamos los envíos directamente por WhatsApp una vez realizado el pedido. Hacemos entregas locales y envíos a zonas cercanas.",
  },
  {
    id: "pagos",
    title: "Medios de Pago",
    icon: CreditCard,
    content:
      "Aceptamos transferencia bancaria, Mercado Pago y efectivo al momento de la entrega o retiro en local.",
  },
  {
    id: "cambios",
    title: "Políticas de Cambio y Devolución",
    icon: RefreshCw,
    content:
      "Por razones de higiene y seguridad en productos de perfumería, cosmética y pañalería, los cambios se realizan exclusivamente si el producto conserva su empaque original sellado y sin uso.",
  },
];

export default function AcordeonFAQ() {
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setFaqAbierta((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-8 border-t border-slate-100 pt-6 space-y-2">
      {FAQ_ITEMS.map(({ id, title, icon: Icon, content }) => {
        const isOpen = faqAbierta === id;
        const panelId = `faq-panel-${id}`;
        const buttonId = `faq-button-${id}`;

        return (
          <div
            key={id}
            className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-colors"
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggleFaq(id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100/60 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-[#0E6E55] shrink-0" />
                <span>{title}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isOpen ? "rotate-180 text-[#0E6E55]" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-3.5 pb-3.5 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 bg-white animate-in fade-in-50 duration-150"
              >
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}