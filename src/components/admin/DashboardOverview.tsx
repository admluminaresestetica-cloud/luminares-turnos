'use client';

import type { Reserva } from '@/lib/types';
import { citasHoy, pendientesSena, proximaJornadaLaser, proximosTurnos } from '@/lib/admin/metricas';
import { renderDetalleReserva, renderFechaHora } from '@/lib/admin/helpers';
import type { ConfiguracionCalendario } from '@/lib/types';
import type { AdminTab } from '@/lib/admin/constants';

interface Props {
  reservas: Reserva[];
  configLaser: ConfiguracionCalendario | null;
  onNavigate: (tab: AdminTab) => void;
}

export default function DashboardOverview({ reservas, configLaser, onNavigate }: Props) {
  const hoy = citasHoy(reservas);
  const pendientes = pendientesSena(reservas);
  const proxima = proximaJornadaLaser(reservas, configLaser);
  const proximos = proximosTurnos(reservas);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Citas de hoy</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{hoy.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Próxima jornada láser</p>
          {proxima.fecha ? (
            <>
              <p className="text-lg font-bold text-violet-700 mt-1">
                {proxima.ocupacionPct}% ocupación
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {proxima.fecha} · {proxima.reservasDia} turnos
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 mt-2">Sin fechas láser programadas</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">Pendientes de seña</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendientes}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onNavigate('agenda')}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
        >
          Ver agenda completa
        </button>
        <button
          type="button"
          onClick={() => onNavigate('precios')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
        >
          Gestionar precios
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Próximos turnos a atender</h2>
        </div>
        {proximos.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">No hay turnos próximos.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {proximos.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.fue_modificado ? 'bg-red-500' : 'bg-emerald-500'}`}
                  title={r.fue_modificado ? 'Modificado' : 'Original'}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{r.cliente_nombre}</p>
                  <p className="text-xs text-slate-500 truncate">{renderDetalleReserva(r)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-700">{renderFechaHora(r.fecha_hora_inicio)}</p>
                  <p className="text-xs text-slate-400 font-mono">{r.codigo_unico}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
