'use client';

import { CalendarClock } from 'lucide-react';

interface ResumenProps {
  reserva: any;
  cobradoEnPuerta: boolean;
  onToggleCobrado: (cobrado: boolean) => void;
}

export default function ResumenReservaCobro({
  reserva,
  cobradoEnPuerta,
  onToggleCobrado,
}: ResumenProps) {
  if (!reserva) return null;

  const precioTotal = Number(reserva.precio_total || reserva.monto_total || 0);
  const montoAbonadoWeb = Number(reserva.monto_abonado || reserva.monto_sena || reserva.sena || 0);
  const saldoPendiente = Math.max(0, precioTotal - montoAbonadoWeb);

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
    <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:p-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <CalendarClock className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-wide text-indigo-700">
            Turno / reserva web
          </span>
          <p className="mt-0.5 text-sm font-semibold text-indigo-950">
            {obtenerDetalleReservaTexto(reserva)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/70 p-3 text-center">
        <div>
          <p className="text-[11px] font-medium text-slate-500">Total</p>
          <p className="text-sm font-bold text-slate-800">${precioTotal}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500">Señado</p>
          <p className="text-sm font-bold text-emerald-700">${montoAbonadoWeb}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500">Saldo</p>
          <p className="text-sm font-bold text-indigo-900">${saldoPendiente}</p>
        </div>
      </div>

      {saldoPendiente > 0 && (
        <label
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
            cobradoEnPuerta
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-indigo-200 bg-white hover:bg-indigo-50/60'
          }`}
        >
          <span className="flex items-center gap-2.5 text-xs font-semibold text-indigo-900">
            <input
              type="checkbox"
              checked={cobradoEnPuerta}
              onChange={(e) => onToggleCobrado(e.target.checked)}
              className="h-4.5 w-4.5 shrink-0 cursor-pointer rounded text-emerald-600 focus:ring-emerald-500"
            />
            Marcar saldo de ${saldoPendiente} como cobrado en recepción
          </span>
          {cobradoEnPuerta && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Cobrado
            </span>
          )}
        </label>
      )}
    </div>
  );
}