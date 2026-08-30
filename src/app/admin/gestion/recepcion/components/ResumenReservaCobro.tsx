'use client';

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
  const montoAbonadoWeb = Number(reserva.monto_abonado || reserva.sena || 0);
  const saldoPendiente = Math.max(0, precioTotal - montoAbonadoWeb);

  const obtenerDetalleReservaTexto = (r: any) => {
    if (typeof r.detalle_reserva === 'string') return r.detalle_reserva;
    if (Array.isArray(r.detalle_reserva)) {
      return r.detalle_reserva.map((z: any) => z.nombre || z.zona || z).join(', ');
    }
    return r.servicio_tipo || 'Reserva estándar';
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase text-indigo-900">
            📅 Turno / Reserva Web
          </span>
          <p className="text-sm font-semibold text-indigo-950 mt-0.5">
            Zonas Contratadas: {obtenerDetalleReservaTexto(reserva)}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="text-slate-500">Total: ${precioTotal}</p>
          <p className="text-emerald-700 font-semibold">Señado: ${montoAbonadoWeb}</p>
          <p className="text-sm font-bold text-indigo-900 mt-1">
            Saldo Pendiente: ${saldoPendiente}
          </p>
        </div>
      </div>

      {saldoPendiente > 0 && (
        <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-900">
            <input
              type="checkbox"
              checked={cobradoEnPuerta}
              onChange={(e) => onToggleCobrado(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>Marcar Saldo de ${saldoPendiente} como COBRADO en Recepción</span>
          </label>
          {cobradoEnPuerta && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Cobrado
            </span>
          )}
        </div>
      )}
    </div>
  );
}