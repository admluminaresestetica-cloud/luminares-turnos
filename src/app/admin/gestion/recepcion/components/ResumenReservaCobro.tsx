'use client';

import { CalendarClock } from 'lucide-react';

interface ResumenProps {
  reserva: any;
  // Mantenemos estas props opcionales por si se llaman desde la vista principal sin romper el tipo
  cobradoEnPuerta?: boolean;
  onToggleCobrado?: (cobrado: boolean) => void;
}

export default function ResumenReservaCobro({
  reserva,
}: ResumenProps) {
  if (!reserva) return null;

  const obtenerDetalleReservaTexto = (r: any) => {
    let detalle = r.detalle_reserva;

    if (!detalle) {
      return r.servicio_tipo || 'Reserva estándar';
    }

    // 1. Si viene como objeto JSONB
    if (typeof detalle === 'object' && detalle !== null) {
      if (detalle.detalle_texto) return detalle.detalle_texto;
      if (detalle.nombre_promo) return detalle.nombre_promo;
      if (detalle.nombre_zona) return detalle.nombre_zona;
      if (detalle.titulo) return detalle.titulo;
      if (detalle.nombre) return detalle.nombre;
      if (detalle.descripcion) return detalle.descripcion;
      if (Array.isArray(detalle.zonas)) {
        return detalle.zonas.map((z: any) => (typeof z === 'string' ? z : z.nombre || z.nombre_zona)).join(', ');
      }
    }

    // 2. Si viene como string
    if (typeof detalle === 'string') {
      try {
        const parsed = JSON.parse(detalle);
        if (parsed.detalle_texto) return parsed.detalle_texto;
        if (parsed.nombre_promo) return parsed.nombre_promo;
        return parsed;
      } catch (e) {
        return detalle;
      }
    }

    // 3. Si viene como Array
    if (Array.isArray(detalle)) {
      return detalle
        .map((z: any) => (typeof z === 'string' ? z : z.detalle_texto || z.nombre_promo || z.nombre || z.zona))
        .filter(Boolean)
        .join(', ');
    }

    return r.servicio_tipo || 'Reserva estándar';
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <CalendarClock className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
            Turno / reserva web
          </span>
          <p className="mt-0.5 text-sm font-semibold text-indigo-950">
            {obtenerDetalleReservaTexto(reserva)}
          </p>
        </div>
      </div>
    </div>
  );
}