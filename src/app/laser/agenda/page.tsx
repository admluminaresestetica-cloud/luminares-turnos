'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Zap } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { loadLaserSeleccion } from '@/lib/booking/session';
import type { SeleccionLaser } from '@/lib/booking/session';
import type { DetalleReservaLaser } from '@/lib/types';

export default function LaserAgendaPage() {
  const [seleccion, setSeleccion] = useState<SeleccionLaser | null>(null);

  useEffect(() => {
    setSeleccion(loadLaserSeleccion());
  }, []);

  // Estado si el usuario entra directo sin haber seleccionado zonas
  if (!seleccion) {
    return (
      <main className="min-h-screen bg-[#edf0ec] dark:bg-zinc-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white/90 dark:bg-zinc-900 backdrop-blur-sm border border-stone-200/80 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
          
          <div className="w-14 h-14 bg-[#1c352a] text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Calendar className="w-7 h-7 stroke-[2]" />
          </div>

          <span className="text-[10px] font-black tracking-[0.2em] text-[#1c352a] dark:text-emerald-400 uppercase block mb-1">
            Paso previo requerido
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-white mb-2">
            No hay servicio seleccionado
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            Para elegir el día y horario de tu turno, primero elegí tus zonas o promos de depilación láser.
          </p>

          <Link
            href="/laser"
            className="w-full bg-[#1c352a] hover:bg-[#183024] text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-200 shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 text-xs tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a elegir servicios</span>
          </Link>
        </div>
      </main>
    );
  }

  const detalleReserva: DetalleReservaLaser = {
    genero: seleccion.genero,
    modo: seleccion.modo,
    promo_id: seleccion.promo_id,
    zonas_ids: seleccion.zonas_ids,
    zonas_extra_ids: seleccion.zonas_extra_ids?.length ? seleccion.zonas_extra_ids : undefined,
    descuento_extra_pct: seleccion.zonas_extra_ids?.length ? 10 : undefined,
  };

  return (
    <div className="min-h-screen bg-[#edf0ec] dark:bg-zinc-950 font-sans flex flex-col">
      {/* 1. Header móvil limpio e integrado con los tonos verde/manteca */}
      <header className="sticky top-0 z-30 bg-[#edf0ec]/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800 px-4 sm:px-6 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/laser"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 px-3.5 py-2 rounded-2xl transition-all active:scale-95 shadow-xs hover:text-stone-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 border border-stone-200/80 dark:border-zinc-800 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-extrabold text-stone-800 dark:text-zinc-200 tracking-tight">
              Elegir fecha y hora
            </span>
          </div>
        </div>
      </header>

      {/* 2. Área principal enfocada en la agenda */}
      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 flex-1">
        <FlujoAgendaConfirmacion
          tipo="laser"
          precioTotal={seleccion.precio_total}
          duracionTotal={seleccion.duracion_total}
          detalleTexto={seleccion.detalle_texto ?? 'Depilación láser'}
          detalleReserva={detalleReserva}
          volverHref="/laser"
          titulo=""
          colorAccent="emerald"
        />
      </main>
    </div>
  );
}