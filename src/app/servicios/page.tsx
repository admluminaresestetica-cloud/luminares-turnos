'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Hand, Heart, Eye, ChevronRight, X, ZoomIn, LayoutList } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { SERVICIOS_STORAGE_KEY } from '@/lib/booking/session';
import {
  getServiciosGenerales,
  LABELS_CATEGORIA,
} from '@/lib/supabase/servicios-generales';
import type { CategoriaGeneral, DetalleReservaGeneral, ServicioGeneral } from '@/lib/types';

type Paso = 'categoria' | 'servicios' | 'agenda';

// Configuración visual por categoría (Ícono, degradado del badge y acentos)
const CATEGORIA_CONFIG: Record<
  string,
  { icon: any; gradient: string; ringColor: string; softBg: string }
> = {
  faciales: {
    icon: Sparkles,
    gradient: 'from-rose-400 to-rose-600',
    ringColor: 'group-hover:ring-rose-200',
    softBg: 'bg-rose-50',
  },
  unas: {
    icon: Hand,
    gradient: 'from-indigo-400 to-indigo-600',
    ringColor: 'group-hover:ring-indigo-200',
    softBg: 'bg-indigo-50',
  },
  uñas: {
    icon: Hand,
    gradient: 'from-indigo-400 to-indigo-600',
    ringColor: 'group-hover:ring-indigo-200',
    softBg: 'bg-indigo-50',
  },
  masajes: {
    icon: Heart,
    gradient: 'from-amber-400 to-amber-600',
    ringColor: 'group-hover:ring-amber-200',
    softBg: 'bg-amber-50',
  },
  ojos: {
    icon: Eye,
    gradient: 'from-violet-400 to-violet-600',
    ringColor: 'group-hover:ring-violet-200',
    softBg: 'bg-violet-50',
  },
};

const CATEGORIA_CONFIG_DEFAULT = {
  icon: LayoutList,
  gradient: 'from-rose-400 to-rose-600',
  ringColor: 'group-hover:ring-rose-200',
  softBg: 'bg-rose-50',
};

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioGeneral[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState<Paso>('categoria');
  const [categoria, setCategoria] = useState<CategoriaGeneral | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  // Estado puramente visual: controla el lightbox de imagen (no afecta la lógica de reserva)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const data = await getServiciosGenerales();
      setServicios(data);
      setCargando(false);
    }
    cargar();
  }, []);

  const categorias = useMemo(() => {
    const cats = new Set(servicios.map((s) => s.categoria));
    return Array.from(cats) as CategoriaGeneral[];
  }, [servicios]);

  const serviciosCategoria = useMemo(
    () => (categoria ? servicios.filter((s) => s.categoria === categoria) : []),
    [servicios, categoria]
  );

  const totales = useMemo(() => {
    const sel = servicios.filter((s) => seleccionados.includes(s.id));
    return {
      precio: sel.reduce((acc, s) => acc + Number(s.precio), 0),
      duracion: sel.reduce((acc, s) => acc + s.duracion_minutos, 0),
      detalle: sel.map((s) => s.subtipo).join(' · '),
      items: sel.map((s) => ({
        id: s.id,
        subtipo: s.subtipo,
        precio: Number(s.precio),
        duracion_minutos: s.duracion_minutos,
      })),
    };
  }, [servicios, seleccionados]);

  const toggleServicio = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinuarServicios = () => {
    if (seleccionados.length === 0) return;
    sessionStorage.setItem(
      SERVICIOS_STORAGE_KEY,
      JSON.stringify({
        servicios_ids: seleccionados,
        precio_total: totales.precio,
        duracion_total: totales.duracion,
        detalle_texto: totales.detalle,
      })
    );
    setPaso('agenda');
  };

  if (paso === 'agenda' && seleccionados.length > 0) {
    const detalleReserva: DetalleReservaGeneral = { servicios: totales.items };

    return (
      <FlujoAgendaConfirmacion
        tipo="general"
        precioTotal={totales.precio}
        duracionTotal={totales.duracion}
        detalleTexto={totales.detalle}
        detalleReserva={detalleReserva}
        onVolver={() => setPaso('servicios')}
        volverLabel="← Modificar servicios"
        titulo="Agenda — Servicios"
        colorAccent="rose"
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        <Link
          href="/"
          className="text-sm text-rose-600 font-semibold hover:underline inline-block mb-6"
        >
          ← Volver al inicio
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Servicios Generales</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {paso === 'categoria'
              ? 'Paso 1: Elegí una categoría'
              : 'Paso 2: Seleccioná uno o más servicios'}
          </p>
        </header>

        {cargando ? (
          <div className="text-center py-16 text-slate-400 text-sm">Cargando servicios...</div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No hay servicios disponibles en este momento.
          </div>
        ) : paso === 'categoria' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((cat) => {
              const count = servicios.filter((s) => s.categoria === cat).length;
              const key = cat.toLowerCase();
              const config = CATEGORIA_CONFIG[key] || CATEGORIA_CONFIG_DEFAULT;
              const Icono = config.icon;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoria(cat);
                    setSeleccionados([]);
                    setPaso('servicios');
                  }}
                  className={`
                    group relative flex items-center gap-4 p-4 sm:p-5
                    bg-white rounded-[20px] border border-slate-100
                    shadow-[0_2px_10px_rgba(15,23,42,0.06)]
                    hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)]
                    active:scale-[0.98]
                    transition-all duration-200 ease-out
                    cursor-pointer text-left
                  `}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0 shadow-inner ring-4 ring-transparent ${config.ringColor} transition-all duration-200`}
                  >
                    <Icono className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 capitalize text-base leading-snug">
                      {LABELS_CATEGORIA[cat] ?? cat}
                    </p>
                    <span className="inline-block text-xs font-medium text-slate-400 mt-0.5">
                      {count} {count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-900 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setPaso('categoria');
                setCategoria(null);
                setSeleccionados([]);
              }}
              className="text-sm text-rose-600 font-semibold hover:underline mb-4"
            >
              ← Cambiar categoría
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {categoria ? LABELS_CATEGORIA[categoria] : ''}
            </h2>

            <div className="space-y-3">
              {serviciosCategoria.map((servicio: any) => {
                const activo = seleccionados.includes(servicio.id);
                // Permite verificar tanto imagen_url (Supabase) como el campo legacy imagen
                const imagenParaMostrar = servicio.imagen_url || servicio.imagen;
                const imagenSrc = imagenParaMostrar
                  ? imagenParaMostrar.startsWith('http')
                    ? imagenParaMostrar
                    : `/images/${imagenParaMostrar}`
                  : null;
                const tieneDespliegue = Boolean(servicio.descripcion || imagenSrc);

                return (
                  <button
                    key={servicio.id}
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    className={`
                      w-full text-left rounded-2xl border overflow-hidden
                      transition-all duration-200 ease-out
                      ${
                        activo
                          ? 'border-rose-300 bg-rose-50/60 shadow-md ring-1 ring-rose-200'
                          : 'border-slate-200 bg-white hover:border-rose-200 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-semibold text-slate-800">{servicio.subtipo}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {servicio.duracion_minutos} min
                        </p>
                      </div>
                      <p className="font-bold text-slate-800 shrink-0">
                        ${Number(servicio.precio).toLocaleString('es-AR')}
                      </p>
                    </div>

                    {/* CONTENIDO DESPLEGABLE: transición tipo acordeón, fluida en ambas direcciones */}
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        activo && tieneDespliegue
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-rose-200/60 mx-4 -mt-px">
                          {imagenSrc && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightbox({ src: imagenSrc, alt: servicio.subtipo });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  setLightbox({ src: imagenSrc, alt: servicio.subtipo });
                                }
                              }}
                              className="group/img relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-sm border border-rose-100 bg-slate-100 cursor-zoom-in"
                            >
                              <img
                                src={imagenSrc}
                                alt={servicio.subtipo}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                                onError={(e: any) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                                <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 shadow-sm">
                                  <ZoomIn className="w-4 h-4 text-slate-700" />
                                </div>
                              </div>
                            </div>
                          )}
                          {servicio.descripcion && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {servicio.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lightbox: visor de imagen a pantalla completa (solo visual, no afecta la lógica de reserva) */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors duration-200"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}

      {paso === 'servicios' && seleccionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.25)] px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold tracking-tight">
                    ${totales.precio.toLocaleString('es-AR')}
                  </p>
                  <p className="text-slate-400 text-sm">{totales.duracion} min</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{totales.detalle}</p>
              </div>
              <button
                type="button"
                onClick={handleContinuarServicios}
                className="shrink-0 bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 active:scale-[0.98] text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-rose-500/30 transition-all duration-200 text-sm"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
