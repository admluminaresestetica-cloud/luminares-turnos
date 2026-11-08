'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, HelpCircle } from "lucide-react";

interface PreguntaDB {
  id: number;
  pregunta: string;
  respuesta: string;
  badge?: string;
  orden?: number;
}

const BADGES_CONFIG: Record<string, { label: string; color: string }> = {
  laser: { label: 'Depilación Láser', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40' },
  servicios: { label: 'Servicios Generales', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40' },
  pagos: { label: 'Pagos y Finanzas', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' },
  envios: { label: 'Envíos y Tienda', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40' },
  legales: { label: 'Legales / Arrepentimiento', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' },
  Terminos: { label: 'Términos y Condiciones', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' },
};

export default function AcordeonFAQ() {
  const [faqs, setFaqs] = useState<PreguntaDB[]>([]);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqsTienda = async () => {
      try {
        const { data, error } = await supabase
          .from("preguntas_frecuentes")
          .select("*")
          .order("orden", { ascending: true });

        if (error) throw error;
        if (data) setFaqs(data);
      } catch (err) {
        console.error("Error al cargar FAQs en tienda:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqsTienda();
  }, []);

  const toggleFaq = (id: number) => {
    setFaqAbierta((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <div className="mt-8 pt-6 text-center text-xs text-slate-400">Cargando información...</div>;
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-slate-100 dark:border-zinc-800 pt-6 space-y-2">
      {faqs.map((faq) => {
        const isOpen = faqAbierta === faq.id;
        const panelId = `faq-panel-${faq.id}`;
        const buttonId = `faq-button-${faq.id}`;
        const badgeInfo = faq.badge && BADGES_CONFIG[faq.badge] ? BADGES_CONFIG[faq.badge] : null;

        return (
          <div
            key={faq.id}
            className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 overflow-hidden transition-colors"
          >
            <button
              id={buttonId}
              type="button"
              onClick={() => toggleFaq(faq.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 flex-1 pr-2 flex-wrap">
                <HelpCircle className="h-4 w-4 shrink-0 text-[#0E6E55] dark:text-emerald-400" />
                <span>{faq.pregunta}</span>
                {badgeInfo && (
                  <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${badgeInfo.color}`}>
                    {badgeInfo.label}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${
                  isOpen ? "rotate-180 text-[#0E6E55] dark:text-emerald-400" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-3.5 pb-3.5 pt-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in fade-in-50 duration-150"
              >
                {faq.respuesta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}