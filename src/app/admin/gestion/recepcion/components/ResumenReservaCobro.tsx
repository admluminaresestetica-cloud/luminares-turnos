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

      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-white/80 p-3 text-center">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Total</p>
          <p className="text-sm font-bold text-slate-800">${precioTotal}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400">Señado</p>
          <p className="text-sm font-bold text-emerald-600">${montoAbonadoWeb}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400">Saldo</p>
          <p className="text-sm font-bold text-indigo-700">${saldoPendiente}</p>
        </div>
      </div>

      {saldoPendiente > 0 && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
            cobradoEnPuerta ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-100 bg-white'
          }`}
        >
          <span className="text-xs font-semibold text-indigo-900">
            Marcar saldo de ${saldoPendiente} como cobrado
          </span>

          {/* Switch estilo iOS/Shadcn */}
          <button
            type="button"
            role="switch"
            aria-checked={cobradoEnPuerta}
            onClick={() => onToggleCobrado(!cobradoEnPuerta)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              cobradoEnPuerta ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                cobradoEnPuerta ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {saldoPendiente > 0 && cobradoEnPuerta && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Cobrado en recepción
        </span>
      )}
    </div>
  );
}