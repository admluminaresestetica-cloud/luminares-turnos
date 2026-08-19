'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FlujoAgendaConfirmacion from '@/components/booking/FlujoAgendaConfirmacion';
import { loadLaserSeleccion } from '@/lib/booking/session';
import type { SeleccionLaser } from '@/lib/booking/session';
import type { DetalleReservaLaser } from '@/lib/types';

export default function LaserAgendaPage() {
  const [seleccion, setSeleccion] = useState<SeleccionLaser | null>(null);

  useEffect(() => {
    setSeleccion(loadLaserSeleccion());
  }, []);

  if (!seleccion) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm max-w-sm w-full">
          <p className="text-slate-600 font-medium mb-4">No hay selección activa</p>
          <Link
            href="/laser"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a elegir servicios
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
    <FlujoAgendaConfirmacion
      tipo="laser"
      precioTotal={seleccion.precio_total}
      duracionTotal={seleccion.duracion_total}
      detalleTexto={seleccion.detalle_texto ?? 'Depilación láser'}
      detalleReserva={detalleReserva}
      volverHref="/laser"
      titulo="Agenda — Láser"
      colorAccent="violet"
    />
  );
}