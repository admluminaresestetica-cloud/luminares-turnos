'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { SERVICIOS_STORAGE_KEY } from '@/lib/booking/session';
import {
  getServiciosGenerales,
  LABELS_CATEGORIA,
} from '@/lib/supabase/servicios-generales';
import type { CategoriaGeneral, DetalleReservaGeneral, ServicioGeneral } from '@/lib/types';

type Paso = 'categoria' | 'servicios' | 'agenda';

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
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoria(cat);
                    setSeleccionados([]);
                    setPaso('servicios');
                  }}
                  className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-rose-300 hover:bg-rose-50/50 transition-all shadow-sm"
                >
                  <p className="font-semibold text-slate-800 text-lg">
                    {LABELS_CATEGORIA[cat] ?? cat}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {count} {count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                  </p>
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
              {serviciosCategoria.map((servicio) => {
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
