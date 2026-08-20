'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Hand, Heart, Eye, ChevronRight } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { SERVICIOS_STORAGE_KEY } from '@/lib/booking/session';
import {
  getServiciosGenerales,
  LABELS_CATEGORIA,
} from '@/lib/supabase/servicios-generales';
import type { CategoriaGeneral, DetalleReservaGeneral, ServicioGeneral } from '@/lib/types';

type Paso = 'categoria' | 'servicios' | 'agenda';

// Configuración visual por categoría (Ícono, Fondo y Colores de hover)
const CATEGORIA_CONFIG: Record<string, { icon: any; colorBg: string; colorText: string; borderColor: string }> = {
  faciales: {
    icon: Sparkles,
    colorBg: 'bg-rose-50 group-hover:bg-rose-500',
    colorText: 'text-rose-600 group-hover:text-white',
    borderColor: 'hover:border-rose-300',
  },
  unas: {
    icon: Hand,
    colorBg: 'bg-indigo-50 group-hover:bg-indigo-500',
    colorText: 'text-indigo-600 group-hover:text-white',
    borderColor: 'hover:border-indigo-300',
  },
  uñas: {
    icon: Hand,
    colorBg: 'bg-indigo-50 group-hover:bg-indigo-500',
    colorText: 'text-indigo-600 group-hover:text-white',
    borderColor: 'hover:border-indigo-300',
  },
  masajes: {
    icon: Heart,
    colorBg: 'bg-amber-50 group-hover:bg-amber-500',
    colorText: 'text-amber-600 group-hover:text-white',
    borderColor: 'hover:border-amber-300',
  },
  ojos: {
    icon: Eye,
    colorBg: 'bg-violet-50 group-hover:bg-violet-500',
    colorText: 'text-violet-600 group-hover:text-white',
    borderColor: 'hover:border-violet-300',
  },
};

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioGeneral[]>([]);
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState<Paso>('categoria');
  const [categoria, setCategoria] = useState<CategoriaGeneral | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

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
      <div className="max-w-2xl mx-auto p-6 md:p-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categorias.map((cat) => {
              const count = servicios.filter((s) => s.categoria === cat).length;
              const key = cat.toLowerCase();
              const config = CATEGORIA_CONFIG[key] || {
                icon: Sparkles,
                colorBg: 'bg-rose-50 group-hover:bg-rose-500',
                colorText: 'text-rose-600 group-hover:text-white',
                borderColor: 'hover:border-rose-300',
              };
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
                  className={`group relative flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 text-left ${config.borderColor}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 shrink-0 ${config.colorBg}`}
                    >
                      <Icono className={`w-6 h-6 transition-colors duration-200 ${config.colorText}`} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors capitalize text-base">
                        {LABELS_CATEGORIA[cat] ?? cat}
                      </p>
                      <span className="inline-block text-xs font-medium text-slate-500 mt-0.5">
                        {count} {count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
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
                return (
                  <button
                    key={servicio.id}
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    className={`
                      w-full text-left border rounded-2xl p-4 transition-all
                      ${activo
                        ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-200'
                        : 'border-slate-200 bg-white hover:border-rose-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-3">
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

                    {/* CONTENIDO DESPLEGABLE: Se muestra solo si está activo y tiene descripción o imagen */}
                    {activo && (servicio.descripcion || servicio.imagen) && (
                      <div className="mt-4 pt-4 border-t border-rose-200/60 animate-fadeIn space-y-3">
                        {servicio.imagen && (
                          <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm bg-slate-100">
                            <img
                              src={`/images/${servicio.imagen}`}
                              alt={servicio.subtipo}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                // Plan de resguardo si la imagen no existe o está mal escrita
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {servicio.descripcion && (
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {paso === 'servicios' && seleccionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-bold">${totales.precio.toLocaleString('es-AR')}</p>
                  <p className="text-slate-400 text-sm">{totales.duracion} min</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{totales.detalle}</p>
              </div>
              <button
                type="button"
                onClick={handleContinuarServicios}
                className="shrink-0 bg-rose-500 hover:bg-rose-400 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
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
