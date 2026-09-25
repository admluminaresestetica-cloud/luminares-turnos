'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, BookOpen, X } from 'lucide-react';
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
            type="button"
            onClick={() => {
              if (guiaActual.media_url) {
                setGuiaSeleccionada(guiaActual as Guia);
              } else {
                alert('Pronto estará disponible el contenido explicativo.');
              }
            }}
            className="text-left p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-950/10 dark:border-zinc-800 flex flex-col justify-between space-y-2.5 active:scale-95 transition-all duration-200 shadow-md shadow-emerald-950/5 w-full group h-full cursor-pointer hover:bg-white dark:hover:bg-zinc-900"
          >
            {/* Contenedor del ícono con badge verde uniforme */}
            <div className="w-full h-14 rounded-xl bg-[#0E6E55]/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#0E6E55] dark:text-emerald-400 group-hover:scale-[1.02] transition-transform relative">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />

              {/* Indicadores en la tarjeta si hay más de 1 guía */}
              {guias.length > 1 && (
                <div className="absolute bottom-1.5 flex gap-1 z-10">
                  {guias.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1 rounded-full transition-all ${
                        idx === indiceActual
                          ? 'w-3 bg-[#0E6E55] dark:bg-emerald-400'
                          : 'w-1 bg-[#0E6E55]/30 dark:bg-emerald-400/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-800 dark:text-zinc-100 leading-tight line-clamp-2">
                {guiaActual.titulo}
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium leading-tight mt-0.5 line-clamp-1">
                {guiaActual.subtitulo}
              </p>
              <span className="text-[10px] font-extrabold text-[#0E6E55] dark:text-emerald-400 block mt-1">
                Ver guía →
              </span>
            </div>
          </button>
        </div>

        {/* Consultar Mi Reserva */}
        <Link
          href="/mis-turnos"
          className="p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-950/10 dark:border-zinc-800 flex flex-col justify-between space-y-2.5 active:scale-95 transition-all duration-200 shadow-md shadow-emerald-950/5 group cursor-pointer hover:bg-white dark:hover:bg-zinc-900"
        >
          {/* Contenedor del ícono */}
          <div className="w-full h-14 rounded-xl bg-[#0E6E55]/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#0E6E55] dark:text-emerald-400 group-hover:scale-[1.02] transition-transform">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-800 dark:text-zinc-100 leading-tight">
              Consultar Mi Reserva
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium leading-tight mt-0.5">
              Ingresá Celular + Código
            </p>
            <span className="text-[10px] font-extrabold text-[#0E6E55] dark:text-emerald-400 block mt-1">
              Consultar aquí →
            </span>
          </div>
        </Link>
      </div>

      {/* Pop-up Modal */}
      {guiaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-emerald-950/10 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setGuiaSeleccionada(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-4 bg-[#0E6E55] text-white">
              <h3 className="text-sm font-extrabold">{guiaSeleccionada.titulo}</h3>
              {guiaSeleccionada.subtitulo && (
                <p className="text-xs text-emerald-100/90 mt-0.5">{guiaSeleccionada.subtitulo}</p>
              )}
            </div>

            <div className="p-2 overflow-y-auto flex-1 flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
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

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setGuiaSeleccionada(null)}
                className="w-full py-3 bg-[#0E6E55] hover:bg-[#0b5944] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-[#0E6E55]/20"
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
