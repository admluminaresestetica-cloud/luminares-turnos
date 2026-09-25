'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Icons from 'lucide-react';
import { ChevronRight, X, ZoomIn, Check, Sparkles, ArrowLeft, Tag } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { SERVICIOS_STORAGE_KEY } from '@/lib/booking/session';
import {
  getServiciosGenerales,
  LABELS_CATEGORIA,
} from '@/lib/supabase/servicios-generales';
import type { CategoriaGeneral, DetalleReservaGeneral, ServicioGeneral } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Paso = 'categoria' | 'servicios' | 'agenda';

// Función para resolver dinámicamente cualquier ícono guardado en Supabase
function obtenerIconoDinamico(nombreIcono?: string) {
  if (!nombreIcono) return Sparkles;
  const IconoComponente = (Icons as Record<string, any>)[nombreIcono];
  return IconoComponente || Sparkles;
}

// Helper para detectar si una categoría o servicio es un Combo/Promo
function esPromocionOCombo(texto?: string): boolean {
  if (!texto) return false;
  const t = texto.toUpperCase();
  return (
    t.includes('PROMO') ||
    t.includes('COMBO') ||
    t.includes('OFERTA') ||
    t.includes('PACK') ||
    t.includes('+')
  );
}

function ServiciosContent() {
  const searchParams = useSearchParams();
  const categoriaQuery = searchParams.get('categoria');
  const servicioQuery = searchParams.get('servicio');

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

  // 🎯 Procesa la URL dinámicamente para Categoría y Servicio puntual
  useEffect(() => {
    if (!cargando && servicios.length > 0) {
      let catObjetivo: CategoriaGeneral | null = null;
      let servicioEncontradoId: string | null = null;

      // 1. Si viene un SERVICIO específico en la URL (?servicio=Dermaplaning)
      if (servicioQuery) {
        const sq = servicioQuery.toLowerCase().trim();
        const coincidencia = servicios.find(
          (s) =>
            s.subtipo.toLowerCase().trim() === sq ||
            s.subtipo.toLowerCase().includes(sq)
        );

        if (coincidencia) {
          catObjetivo = coincidencia.categoria as CategoriaGeneral;
          servicioEncontradoId = coincidencia.id;
        }
      }

      // 2. Si viene una CATEGORÍA específica en la URL (?categoria=Faciales)
      if (!catObjetivo && categoriaQuery) {
        const cq = categoriaQuery.toLowerCase().trim();
        const coincidenciaCat = servicios.find((s) => {
          const cat = s.categoria.toLowerCase().trim();
          return cat === cq || (cq === 'promos' && esPromocionOCombo(cat));
        })?.categoria;

        if (coincidenciaCat) {
          catObjetivo = coincidenciaCat as CategoriaGeneral;
        }
      }

      // 3. Aplicar estado según lo encontrado
      if (catObjetivo) {
        setCategoria(catObjetivo);
        setPaso('servicios');

        if (servicioEncontradoId) {
          setSeleccionados([servicioEncontradoId]);
        }
      }
    }
  }, [cargando, servicios, categoriaQuery, servicioQuery]);

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
    return Array.from(cats).sort((a, b) => {
      const esA = esPromocionOCombo(a);
      const esB = esPromocionOCombo(b);
      if (esA && !esB) return -1;
      if (!esA && esB) return 1;
      return 0;
    }) as CategoriaGeneral[];
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
    <main className="min-h-screen bg-white dark:bg-zinc-950 pb-36 font-sans selection:bg-stone-100">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">

        {/* Navegación y Encabezado Superior */}
        <div className="mb-6">
          {paso === 'categoria' ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl font-bold text-xs text-stone-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border-stone-200/80 dark:border-zinc-800 shadow-xs mb-4 active:scale-95"
            >
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio</span>
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPaso('categoria');
                setCategoria(null);
                setSeleccionados([]);
              }}
              className="rounded-xl font-bold text-xs text-[#2d5747] dark:text-[#a3c9b8] bg-[#a3c9b8]/15 border-[#a3c9b8]/30 mb-4 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cambiar categoría</span>
            </Button>
          )}

          <header className="space-y-1">
            <Badge
              variant="outline"
              className="bg-[#a3c9b8]/20 text-[#2d5747] dark:text-[#a3c9b8] border-[#a3c9b8]/40 mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em] uppercase"
            >
              Servicios Generales
            </Badge>
            <h1 className="text-2xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight">
              {paso === 'categoria'
                ? 'Elegí una categoría'
                : LABELS_CATEGORIA[categoria!] ?? categoria}
            </h1>
            <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
              {paso === 'categoria'
                ? 'Seleccioná el tipo de tratamiento o combo que buscás'
                : 'Seleccioná uno o más servicios para agendar'}
            </p>
          </header>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-3 border-[#2d5747] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-400">Cargando servicios...</span>
          </div>
        ) : servicios.length === 0 ? (
          <Card className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border-stone-200/80 dark:border-zinc-800 p-6 shadow-xs">
            <p className="text-sm font-semibold text-stone-600 dark:text-zinc-400">
              No hay servicios disponibles en este momento.
            </p>
          </Card>
        ) : paso === 'categoria' ? (
          /* Lista de Categorías */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categorias.map((cat) => {
              const serviciosDeCategoria = servicios.filter((s) => s.categoria === cat);
              const count = serviciosDeCategoria.length;
              const esPromoCat = esPromocionOCombo(cat);

              const iconoNombre = serviciosDeCategoria.find((s) => s.icono)?.icono;
              const IconoDinamico = obtenerIconoDinamico(iconoNombre);

              return (
                <Card
                  key={cat}
                  onClick={() => {
                    setCategoria(cat);
                    setSeleccionados([]);
                    setPaso('servicios');
                  }}
                  className={`group relative flex items-center gap-4 p-4 rounded-[24px] shadow-xs hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer text-left overflow-hidden ${
                    esPromoCat
                      ? 'bg-[#f7f5f0] dark:bg-zinc-900 border-[#a3c9b8] dark:border-[#a3c9b8]/50 ring-1 ring-[#a3c9b8]/30'
                      : 'bg-white dark:bg-zinc-900 border-stone-200/80 dark:border-zinc-800 hover:border-stone-300'
                  }`}
                >
                  {esPromoCat && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#1e2e28] text-[#a3c9b8] text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> PROMO
                    </span>
                  )}

                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200 ${
                      esPromoCat
                        ? 'bg-[#1e2e28] text-[#a3c9b8]'
                        : 'bg-[#a3c9b8]/20 text-[#2d5747] dark:text-[#a3c9b8]'
                    }`}
                  >
                    <IconoDinamico className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p className="font-extrabold text-stone-900 dark:text-zinc-100 capitalize text-sm leading-snug truncate">
                      {LABELS_CATEGORIA[cat] ?? cat}
                    </p>
                    <span className="inline-block text-[11px] font-medium text-stone-500 dark:text-zinc-400 mt-0.5">
                      {count} {count === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 group-hover:bg-[#1e2e28] group-hover:text-white text-stone-400 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Lista de Servicios dentro de la Categoría */
          <div className="space-y-3">
            {serviciosCategoria.map((servicio: any) => {
              const activo = seleccionados.includes(servicio.id);
              const esPromoItem = esPromocionOCombo(servicio.subtipo) || esPromocionOCombo(servicio.categoria);
              const imagenParaMostrar = servicio.imagen_url || servicio.imagen;
              const imagenSrc = imagenParaMostrar
                ? imagenParaMostrar.startsWith('http')
                  ? imagenParaMostrar
                  : `/images/${imagenParaMostrar}`
                : null;
              const tieneDespliegue = Boolean(servicio.descripcion || imagenSrc);

              return (
                <Card
                  key={servicio.id}
                  className={`
                    w-full rounded-[24px] border overflow-hidden transition-all duration-200 relative shadow-xs
                    ${
                      activo
                        ? 'border-[#2d5747] bg-[#a3c9b8]/10 ring-1 ring-[#2d5747]/40'
                        : esPromoItem
                        ? 'border-[#a3c9b8] bg-[#f7f5f0]/60 dark:bg-zinc-900/80 hover:border-[#2d5747]'
                        : 'border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300'
                    }
                  `}
                >
                  {esPromoItem && !activo && (
                    <div className="px-3 py-0.5 bg-[#1e2e28] text-[#a3c9b8] text-[9px] font-bold tracking-wider uppercase inline-flex items-center gap-1 rounded-br-xl">
                      <Tag className="w-2.5 h-2.5" /> COMBO DESTACADO
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          activo
                            ? 'bg-[#1e2e28] border-[#1e2e28] text-[#a3c9b8]'
                            : 'border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {activo && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 dark:text-zinc-100 text-sm leading-snug truncate">
                          {servicio.subtipo}
                        </p>
                        <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 mt-0.5">
                          {servicio.duracion_minutos} min
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-stone-900 dark:text-zinc-100 text-base shrink-0">
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
                      <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#a3c9b8]/30 mx-4 -mt-px">
                        {imagenSrc && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightbox({ src: imagenSrc, alt: servicio.subtipo })
                            }
                            className="group/img relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-white cursor-zoom-in block mt-2"
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
                                <ZoomIn className="w-4 h-4 text-stone-700" />
                              </div>
                            </div>
                          </button>
                        )}
                        {servicio.descripcion && (
                          <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed font-medium">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
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
        <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-40 p-3 sm:px-4 sm:py-0 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="bg-[#1e2e28] text-white rounded-2xl sm:rounded-3xl shadow-xl px-5 py-3.5 flex items-center justify-between gap-4 border border-[#2d4239]">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black tracking-tight text-[#a3c9b8]">
                    ${totales.precio.toLocaleString('es-AR')}
                  </p>
                  <p className="text-stone-300 text-xs font-semibold">{totales.duracion} min</p>
                </div>
                <p className="text-[11px] text-stone-300 truncate">{totales.detalle}</p>
              </div>
              <Button
                type="button"
                onClick={handleContinuarServicios}
                className="shrink-0 bg-[#a3c9b8] hover:bg-[#8eb8a5] active:scale-95 text-[#1e2e28] font-extrabold px-5 py-2.5 h-auto rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ServiciosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2d5747] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServiciosContent />
    </Suspense>
  );
}