'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SeccionFAQ() {
  const [abiertoId, setAbiertoId] = useState<number | null>(null);
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

  const toggleFAQ = (id: number) => {
    setAbiertoId(abiertoId === id ? null : id);
  };

  return (
    <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header de la sección */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200/80 mb-3 shadow-xs">
          
          <span>Dudas frecuentes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Preguntas Frecuentes e Información Útil
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
          Todo lo que necesitás saber antes de tu primera sesión
        </p>
      </div>

      {/* Lista de acordeones */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Cargando preguntas...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              No hay preguntas frecuentes cargadas todavía.
            </p>
          </div>
        ) : (
          faqs.map((faq) => {
            const estaAbierto = abiertoId === faq.id;

            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden bg-white shadow-xs ${
                  estaAbierto
                    ? 'border-rose-300 shadow-md ring-2 ring-rose-100/50'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        estaAbierto
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-600'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 leading-snug group-hover:text-slate-900">
                      {faq.pregunta}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      estaAbierto
                        ? 'bg-rose-100 text-rose-600 rotate-180'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Contenido desplegable con animación fluida */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    estaAbierto
                      ? 'grid-rows-[1fr] opacity-100 pb-5 px-5 sm:px-6'
                      : 'grid-rows-[0fr] opacity-0 pb-0 px-5 sm:px-6'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed border-t border-slate-100 pt-4">
                      {faq.respuesta}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}