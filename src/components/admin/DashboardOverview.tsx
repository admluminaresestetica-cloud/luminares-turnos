'use client';

import { Calendar, AlertCircle, Sparkles, ArrowRight, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
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
      {/* Tarjetas de Métricas Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Citas de hoy */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Citas de hoy</p>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-3">{hoy.length}</p>
        </div>

        {/* Próxima jornada láser */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Próxima jornada láser</p>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {proxima.fecha ? (
            <div className="mt-2">
              <p className="text-xl font-bold text-purple-700">
                {proxima.ocupacionPct}% ocupación
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {proxima.fecha} · <span className="text-gray-700 font-semibold">{proxima.reservasDia} turnos</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-3 font-medium">Sin fechas láser programadas</p>
          )}
        </div>

        {/* Pendientes de seña */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendientes de seña</p>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-3">{pendientes}</p>
        </div>

      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onNavigate('agenda')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
        >
          <span>Ver agenda completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('precios')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          <DollarSign className="w-3.5 h-3.5 text-gray-500" />
          <span>Gestionar precios</span>
        </button>
      </div>

      {/* Lista de Próximos Turnos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            Próximos turnos a atender
          </h2>
        </div>

        {proximos.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-400">No hay turnos próximos agendados.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 text-xs">
            {proximos.map((r) => (
              <li key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-rose-50/30 transition-colors">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{r.cliente_nombre}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{renderDetalleReserva(r)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-700">{renderFechaHora(r.fecha_hora_inicio)}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{r.codigo_unico}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}