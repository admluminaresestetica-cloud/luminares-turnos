'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { FAQS_DATA } from '@/data/faqs';

export default function SeccionFAQ() {
  const [abiertoId, setAbiertoId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setAbiertoId(abiertoId === id ? null : id);
  };

  return (
    <section className="py-10 px-2 sm:px-4 max-w-lg mx-auto">
      {/* Header de la sección */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Dudas frecuentes</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Preguntas Frecuentes
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Todo lo que necesitás saber antes de tu primera sesión
        </p>
      </div>

      {/* Lista de acordeones */}
      <div className="space-y-3">
        {FAQS_DATA.map((faq) => {
          const estaAbierto = abiertoId === faq.id;

          return (
            <div
              key={faq.id}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-white ${
                estaAbierto
                  ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(faq.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      estaAbierto ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    {faq.pregunta}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    estaAbierto
                      ? 'bg-rose-100 text-rose-600 rotate-180'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Contenido desplegable */}
              {estaAbierto && (
                <div className="px-4 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                  {faq.respuesta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
