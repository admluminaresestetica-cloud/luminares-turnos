'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ChevronRight, X, ZoomIn, Check, Sparkles, ArrowLeft } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { SERVICIOS_STORAGE_KEY } from '@/lib/booking/session';
import {
  getServiciosGenerales,
  LABELS_CATEGORIA,
} from '@/lib/supabase/servicios-generales';
import type { CategoriaGeneral, DetalleReservaGeneral, ServicioGeneral } from '@/lib/types';

type Paso = 'categoria' | 'servicios' | 'agenda';

// Función para resolver dinámicamente cualquier ícono guardado en Supabase
function obtenerIconoDinamico(nombreIcono?: string) {
  if (!nombreIcono) return Sparkles;
  const IconoComponente = (Icons as Record<string, any>)[nombreIcono];
  return IconoComponente || Sparkles;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioGeneral[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState<Paso>('categoria');
  const [categoria, setCategoria] = useState<CategoriaGeneral | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
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

  // Cierra el lightbox con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    if (lightbox) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

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
    <main className="min-h-screen bg-slate-100/80 pb-36 font-sans selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        
        {/* Navegación y Encabezado Superior */}
        <div className="mb-6">
          {paso === 'categoria' ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPaso('categoria');
                setCategoria(null);
                setSeleccionados([]);
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50/80 border border-rose-100 px-3.5 py-2 rounded-xl transition-all active:scale-95 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cambiar categoría</span>
            </button>
          )}

          <header className="space-y-1">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-rose-600 block">
              Servicios Generales
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {paso === 'categoria'
                ? 'Elegí una categoría'
                : LABELS_CATEGORIA[categoria!] ?? categoria}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {paso === 'categoria'
                ? 'Seleccioná el tipo de tratamiento que buscás'
                : 'Seleccioná uno o más servicios para agendar'}
            </p>
          </header>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Cargando servicios...</span>
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <p className="text-sm font-semibold text-slate-600">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : paso === 'categoria' ? (
          /* Lista de Categorías Estilo App */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categorias.map((cat) => {
              const serviciosDeCategoria = servicios.filter((s) => s.categoria === cat);
              const count = serviciosDeCategoria.length;
              
              const iconoNombre = serviciosDeCategoria.find((s) => s.icono)?.icono;
              const IconoDinamico = obtenerIconoDinamico(iconoNombre);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoria(cat);
                    setSeleccionados([]);
                    setPaso('servicios');
                  }}
                  className="group relative flex items-center gap-4 p-4 bg-white rounded-[24px] border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 active:scale-[0.97] transition-all duration-200 cursor-pointer text-left overflow-hidden"
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                    <IconoDinamico className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 capitalize text-sm leading-snug truncate">
                      {LABELS_CATEGORIA[cat] ?? cat}
                    </p>
                    <span className="inline-block text-[11px] font-medium text-slate-400 mt-0.5">
                      {count} {count === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Lista de Servicios dentro de la Categoría */
          <div className="space-y-3">
            {serviciosCategoria.map((servicio: any) => {
              const activo = seleccionados.includes(servicio.id);
              const imagenParaMostrar = servicio.imagen_url || servicio.imagen;
              const imagenSrc = imagenParaMostrar
                ? imagenParaMostrar.startsWith('http')
                  ? imagenParaMostrar
                  : `/images/${imagenParaMostrar}`
                : null;
              const tieneDespliegue = Boolean(servicio.descripcion || imagenSrc);

              return (
                <div
                  key={servicio.id}
                  className={`
                    w-full rounded-[24px] border overflow-hidden transition-all duration-200 bg-white
                    ${
                      activo
                        ? 'border-rose-300 bg-rose-50/30 shadow-xs ring-1 ring-rose-300/50'
                        : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          activo
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {activo && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-snug truncate">
                          {servicio.subtipo}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          {servicio.duracion_minutos} min
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900 text-base shrink-0">
                      ${Number(servicio.precio).toLocaleString('es-AR')}
                    </p>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      activo && tieneDespliegue
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-rose-100/80 mx-4 -mt-px">
                        {imagenSrc && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightbox({ src: imagenSrc, alt: servicio.subtipo })
                            }
                            className="group/img relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-rose-100 bg-slate-100 cursor-zoom-in block mt-2"
                          >
                            <img
                              src={imagenSrc}
                              alt={servicio.subtipo}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-xs">
                                <ZoomIn className="w-4 h-4 text-slate-700" />
                              </div>
                            </div>
                          </button>
                        )}
                        {servicio.descripcion && (
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox para previsualizar imagen */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}

      {/* Barra flotante inferior de confirmación */}
      {paso === 'servicios' && seleccionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-xl px-5 py-3.5 flex items-center justify-between gap-4 border border-slate-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black tracking-tight">
                    ${totales.precio.toLocaleString('es-AR')}
                  </p>
                  <p className="text-slate-400 text-xs font-semibold">{totales.duracion} min</p>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{totales.detalle}</p>
              </div>
              <button
                type="button"
                onClick={handleContinuarServicios}
                className="shrink-0 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
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