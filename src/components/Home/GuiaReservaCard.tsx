'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, BookOpen, X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Guia {
  id: string;
  titulo: string;
  subtitulo?: string;
  tipo_contenido: 'imagen' | 'video';
  media_url: string;
}

export default function GuiaReservaCard() {
  const [guias, setGuias] = useState<Guia[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [guiaSeleccionada, setGuiaSeleccionada] = useState<Guia | null>(null);

  useEffect(() => {
    async function cargarGuias() {
      try {
        const { data } = await supabase
          .from('guias_app')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (data && data.length > 0) {
          setGuias(data);
        }
      } catch (err) {
        console.error('Error al cargar guías:', err);
      }
    }
    cargarGuias();
  }, []);

  // Transición automática cada 4 segundos si hay más de 1 guía activa
  useEffect(() => {
    if (guias.length <= 1) return;

    const interval = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % guias.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [guias]);

  const guiaActual = guias[indiceActual] || {
    id: 'demo-guia',
    titulo: 'Guía de Reserva',
    subtitulo: 'Cómo Reservar (3 simples pasos)',
    tipo_contenido: 'imagen',
    media_url: '',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Guía de Reserva (Carrusel integrado) */}
        <div className="relative group/card">
          <button
            onClick={() => {
              if (guiaActual.media_url) {
                setGuiaSeleccionada(guiaActual as Guia);
              } else {
                alert('Pronto estará disponible el contenido explicativo.');
              }
            }}
            className="text-left p-3.5 rounded-2xl bg-[#f7f5f0]/80 dark:bg-zinc-900/60 border border-[#e8e4d9] dark:border-zinc-800 flex flex-col justify-between space-y-2 active:scale-[0.98] hover:scale-[1.01] transition-all shadow-2xs w-full group h-full"
          >
            {/* Fondo Verde Menta Transparente con Badge de Múltiples Guías */}
            <div className="w-full h-16 rounded-xl bg-[#a3c9b8]/20 flex items-center justify-center text-[#2d5747] dark:text-[#a3c9b8] group-hover:bg-[#1e2e28] group-hover:text-white transition-colors relative">
              <BookOpen className="w-6 h-6" />

              {/* Indicadores en la tarjeta si hay más de 1 guía */}
              {guias.length > 1 && (
                <div className="absolute bottom-1.5 flex gap-1 z-10">
                  {guias.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1 rounded-full transition-all ${
                        idx === indiceActual
                          ? 'w-3 bg-[#2d5747] dark:bg-[#a3c9b8]'
                          : 'w-1 bg-[#2d5747]/30 dark:bg-[#a3c9b8]/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-black text-stone-800 dark:text-zinc-100 leading-tight line-clamp-2">
                {guiaActual.titulo}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium leading-tight mt-0.5 line-clamp-1">
                {guiaActual.subtitulo}
              </p>
              <span className="text-[10px] font-bold text-[#2d5747] dark:text-[#a3c9b8] block mt-1 underline">
                (Ver guía)
              </span>
            </div>
          </button>
        </div>

        {/* Consultar Mi Reserva */}
        <Link
          href="/mis-turnos"
          className="p-3.5 rounded-2xl bg-[#f7f5f0]/80 dark:bg-zinc-900/60 border border-[#e8e4d9] dark:border-zinc-800 flex flex-col justify-between space-y-2 active:scale-[0.98] hover:scale-[1.01] transition-all shadow-2xs group"
        >
          {/* Fondo Verde Menta Transparente */}
          <div className="w-full h-16 rounded-xl bg-[#a3c9b8]/20 flex items-center justify-center text-[#2d5747] dark:text-[#a3c9b8] group-hover:bg-[#1e2e28] group-hover:text-white transition-colors">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black text-stone-800 dark:text-zinc-100 leading-tight">
              Consultar Mi Reserva
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium leading-tight mt-0.5">
              Ingresá Celular + Código
            </p>
            <span className="text-[10px] font-bold text-[#2d5747] dark:text-[#a3c9b8] block mt-1 underline">
              (Consultar aquí)
            </span>
          </div>
        </Link>
      </div>

      {/* Pop-up Modal */}
      {guiaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-stone-200 dark:border-zinc-800">
            <button
              onClick={() => setGuiaSeleccionada(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 bg-[#1e2e28] text-white">
              <h3 className="text-sm font-extrabold">{guiaSeleccionada.titulo}</h3>
              {guiaSeleccionada.subtitulo && (
                <p className="text-xs text-stone-300 mt-0.5">{guiaSeleccionada.subtitulo}</p>
              )}
            </div>

            <div className="p-2 overflow-y-auto flex-1 flex items-center justify-center bg-stone-100 dark:bg-zinc-950">
              {guiaSeleccionada.tipo_contenido === 'video' ? (
                <video
                  src={guiaSeleccionada.media_url}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[60vh] rounded-2xl object-contain"
                />
              ) : (
                <img
                  src={guiaSeleccionada.media_url}
                  alt={guiaSeleccionada.titulo}
                  className="w-full h-auto max-h-[65vh] rounded-2xl object-contain"
                />
              )}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => setGuiaSeleccionada(null)}
                className="w-full py-3 bg-[#1e2e28] text-white font-bold rounded-xl text-xs hover:bg-[#2d4239] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}