'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PreguntaDB {
  id: number;
  pregunta: string;
  respuesta: string;
  badge?: string;
  orden?: number;
}

const BADGES_CONFIG: Record<string, { label: string; color: string }> = {
  laser: { label: 'Depilación Láser', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' },
  servicios: { label: 'Servicios Generales', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' },
  pagos: { label: 'Pagos y Finanzas', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' },
  envios: { label: 'Envíos y Tienda', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300' },
  legales: { label: 'Legales / Arrepentimiento', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' },
  Terminos: { label: 'Términos y Condiciones', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' },
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<PreguntaDB[]>([]);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from('preguntas_frecuentes')
          .select('*')
          .order('orden', { ascending: true });

        if (error) throw error;
        if (data) setFaqs(data);
      } catch (err) {
        console.error('Error al cargar FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (id: number) => {
    setFaqAbierta((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-24 pt-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabecera con botón de regresar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-card border border-border text-foreground hover:bg-accent transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Centro de Ayuda
            </h1>
            <p className="text-xs text-muted-foreground">
              Respuesta a tus dudas e inquietudes habituales
            </p>
          </div>
        </div>

        {/* Lista de Preguntas */}
        <div className="bg-card/60 backdrop-blur-sm border border-border rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1 mb-2">
            Preguntas Frecuentes
          </h2>

          {loading ? (
            <p className="text-center text-xs text-muted-foreground py-8">Cargando información...</p>
          ) : faqs.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">No hay preguntas frecuentes registradas.</p>
          ) : (
            faqs.map((faq) => {
              const isOpen = faqAbierta === faq.id;
              const panelId = `faq-panel-${faq.id}`;
              const buttonId = `faq-button-${faq.id}`;
              const badgeInfo = faq.badge && BADGES_CONFIG[faq.badge] ? BADGES_CONFIG[faq.badge] : null;

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-border bg-card/50 transition-colors overflow-hidden"
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-foreground hover:bg-accent/60 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 flex-1 pr-2 flex-wrap">
                      <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                      <span>{faq.pregunta}</span>
                      {badgeInfo && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${badgeInfo.color}`}>
                          {badgeInfo.label}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-4 pb-4 pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/60 bg-card animate-in fade-in-50 duration-150"
                    >
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}