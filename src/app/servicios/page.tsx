'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as Icons from 'lucide-react';
import { ChevronRight, X, ZoomIn, Check, CircleStar, ArrowLeft, Tag, Clock, ArrowRight } from 'lucide-react';
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
  if (!nombreIcono) return CircleStar;
  const IconoComponente = (Icons as Record<string, any>)[nombreIcono];
  return IconoComponente || CircleStar;
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

function IndicadorPasos({ paso }: { paso: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Paso ${paso} de 2`}>
      {[1, 2].map((n) => (
        <span
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === paso ? 'w-6 bg-primary' : n < paso ? 'w-1.5 bg-primary' : 'w-1.5 bg-border'
          }`}
        />
      ))}
    </div>
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

      if (catObjetivo) {
        setCategoria(catObjetivo);
        setPaso('servicios');

        if (servicioEncontradoId) {
          setSeleccionados([servicioEncontradoId]);
        }
      }
    }
  }, [cargando, servicios, categoriaQuery, servicioQuery]);

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
      />
    );
  }

  // Ícono de la cabecera: el de la categoría elegida o el genérico
  const IconoCabecera =
    paso === 'servicios' && categoria
      ? obtenerIconoDinamico(servicios.find((s) => s.categoria === categoria && s.icono)?.icono)
      : CircleStar;

  return (
    <main className="min-h-screen bg-background px-4 pt-4 pb-44 font-sans selection:bg-muted sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-2xl space-y-5">

        {/* Barra superior: volver + progreso */}
        <div className="flex w-full items-center justify-between">
          {paso === 'categoria' ? (
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card pl-3 pr-4 text-xs font-bold text-muted-foreground shadow-xs transition-all hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPaso('categoria');
                setCategoria(null);
                setSeleccionados([]);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 pl-3 pr-4 text-xs font-bold text-primary transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cambiar categoría</span>
            </button>
          )}
          <IndicadorPasos paso={paso === 'categoria' ? 1 : 2} />
        </div>

        {/* Cabecera destacada */}
        <header className="flex items-center gap-4 px-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-md">
            <IconoCabecera className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {paso === 'categoria'
                ? 'Elegí una categoría'
                : LABELS_CATEGORIA[categoria!] ?? categoria}
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              {paso === 'categoria'
                ? 'Seleccioná el tipo de tratamiento o combo que buscás'
                : 'Seleccioná uno o más servicios para agendar'}
            </p>
          </div>
        </header>

        {cargando ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-semibold text-muted-foreground">Cargando servicios…</span>
          </div>
        ) : servicios.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-card p-10 text-center shadow-xs">
            <p className="text-sm font-semibold text-muted-foreground">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : paso === 'categoria' ? (
          /* Lista de categorías */
          <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-200 sm:grid-cols-2">
            {categorias.map((cat) => {
              const serviciosDeCategoria = servicios.filter((s) => s.categoria === cat);
              const count = serviciosDeCategoria.length;
              const esPromoCat = esPromocionOCombo(cat);

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
                  className={`group flex w-full items-center gap-4 rounded-[24px] border bg-card p-4 text-left shadow-xs transition-all duration-200 cursor-pointer active:scale-[0.97] hover:shadow-md ${
                    esPromoCat
                      ? 'border-primary/50 ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${
                      esPromoCat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <IconoDinamico className="h-6 w-6" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-extrabold capitalize leading-snug tracking-tight text-foreground">
                      {LABELS_CATEGORIA[cat] ?? cat}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      {count} {count === 1 ? 'opción' : 'opciones'}
                      {esPromoCat && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          <Tag className="h-3 w-3" />
                          Promo
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Lista de servicios dentro de la categoría */
          <div className="space-y-3 animate-in fade-in duration-200">
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
                <article
                  key={servicio.id}
                  className={`w-full overflow-hidden rounded-[24px] border bg-card shadow-xs transition-all duration-200 ${
                    activo
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                      : esPromoItem
                      ? 'border-primary/40 hover:border-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    aria-pressed={activo}
                    className="flex w-full select-none items-center justify-between gap-4 p-5 text-left cursor-pointer active:bg-accent/40"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        aria-hidden
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          activo
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-base font-extrabold leading-snug tracking-tight text-foreground">
                          {servicio.subtipo}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Clock className="h-3.5 w-3.5" />
                            {servicio.duracion_minutos} min
                          </span>
                          {esPromoItem && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                              <Tag className="h-3 w-3" />
                              Combo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="shrink-0 text-2xl font-black tabular-nums tracking-tight text-foreground">
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
                      <div className="mx-5 -mt-px space-y-3 border-t border-primary/20 pb-5 pt-3">
                        {imagenSrc && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightbox({ src: imagenSrc, alt: servicio.subtipo })
                            }
                            className="group/img relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-background cursor-zoom-in"
                          >
                            <img
                              src={imagenSrc}
                              alt={servicio.subtipo}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xs backdrop-blur-sm">
                              <ZoomIn className="h-4 w-4" />
                            </span>
                          </button>
                        )}
                        {servicio.descripcion && (
                          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox para previsualizar imagen */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-all active:scale-90 cursor-pointer sm:right-6 sm:top-6"
            aria-label="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-[20px] object-contain shadow-2xl"
          />
        </div>
      )}

      {/* 🎯 Barra inferior adaptativa y fluida sin solapar contenido al scrolear */}
      {paso === 'servicios' && seleccionados.length > 0 && (
        <div className="sticky bottom-6 z-40 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mx-auto max-w-2xl px-1">
            <div className="rounded-[28px] border border-border/80 bg-card/95 backdrop-blur-xl px-6 py-4 text-card-foreground shadow-2xl flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 truncate text-xs font-semibold text-muted-foreground">
                  {totales.detalle}
                </p>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-black leading-none tabular-nums tracking-tight text-foreground">
                    ${totales.precio.toLocaleString('es-AR')}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {totales.duracion} min
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinuarServicios}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-extrabold text-primary-foreground shadow-md transition-all active:scale-95 cursor-pointer hover:opacity-90"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ServiciosContent />
    </Suspense>
  );
}