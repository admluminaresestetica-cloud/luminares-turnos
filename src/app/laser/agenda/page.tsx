'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
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
      <main className="min-h-screen bg-white flex items-center justify-center p-4 font-sans selection:bg-rose-100 selection:text-rose-900">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
          
          <div className="w-14 h-14 bg-white border border-slate-200/80 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Calendar className="w-7 h-7 stroke-[2]" />
          </div>

          <span className="text-[10px] font-black tracking-[0.2em] text-rose-600 uppercase block mb-1">
            Paso previo requerido
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            No hay servicio seleccionado
          </h2>
          <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">
            Para elegir el día y horario de tu turno, primero elegí tus zonas o promos de depilación láser.
          </p>

          <Link
            href="/laser"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-200 shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 text-xs tracking-wide"
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
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* 1. Header móvil limpio y fijo */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/laser"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white hover:text-slate-900 px-3.5 py-2 rounded-xl transition-all active:scale-95 border border-slate-200/80 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-900 tracking-tight">
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
          colorAccent="violet"
        />
      </main>
    </div>
  );
}