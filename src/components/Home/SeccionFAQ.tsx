'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SeccionFAQ() {
  const [abiertoId, setAbiertoId] = useState<string | number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('preguntas_frecuentes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar FAQs:', error);
      } else if (data) {
        setFaqs(data);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: string | number) => {
    setAbiertoId(abiertoId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="h-4 w-40 bg-[hsl(var(--muted))] rounded-md animate-pulse" />
        <div className="space-y-2">
          <div className="h-12 bg-[hsl(var(--muted))/0.5] rounded-2xl animate-pulse" />
          <div className="h-12 bg-[hsl(var(--muted))/0.5] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section className="space-y-3 pt-2">
      {/* Encabezado */}
      <div className="flex items-center gap-1.5 px-1">
        <HelpCircle className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
        <h2 className="text-xs font-black tracking-wider text-[hsl(var(--muted-foreground))] uppercase">
          Preguntas Frecuentes
        </h2>
      </div>

      {/* Lista de Acordeones */}
      <div className="space-y-2">
        {faqs.map((faq) => {
          const estaAbierto = abiertoId === faq.id;

          return (
            <div
              key={faq.id}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-[hsl(var(--card))] ${
                estaAbierto
                  ? 'border-[hsl(var(--primary))/0.5] shadow-xs'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.3]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(faq.id)}
                className="w-full text-left p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none group"
              >
                <span className="text-xs font-bold text-[hsl(var(--card-foreground))] leading-snug">
                  {faq.pregunta}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    estaAbierto
                      ? 'bg-[hsl(var(--primary))/0.15] text-[hsl(var(--primary))] rotate-180'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>

              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  estaAbierto
                    ? 'grid-rows-[1fr] opacity-100 pb-3.5 px-3.5'
                    : 'grid-rows-[0fr] opacity-0 pb-0 px-3.5'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))] font-normal leading-relaxed border-t border-[hsl(var(--border))] pt-2.5">
                    {faq.respuesta}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}