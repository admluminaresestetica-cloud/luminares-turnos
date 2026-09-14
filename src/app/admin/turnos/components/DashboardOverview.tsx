'use client';

import { useMemo } from 'react';
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
  // Memoizamos el cálculo de métricas para optimizar rendimiento
  const hoy = useMemo(() => citasHoy(reservas), [reservas]);
  const pendientes = useMemo(() => pendientesSena(reservas), [reservas]);
  const proxima = useMemo(() => proximaJornadaLaser(reservas, configLaser), [reservas, configLaser]);
  const proximos = useMemo(() => proximosTurnos(reservas), [reservas]);

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Citas de hoy */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Citas de hoy</p>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-500 dark:text-rose-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mt-3">{hoy.length}</p>
        </div>

        {/* Próxima jornada láser */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Próxima jornada láser</p>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {proxima?.fecha ? (
            <div className="mt-2">
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                {proxima.ocupacionPct}% ocupación
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                {proxima.fecha} · <span className="text-gray-700 dark:text-zinc-200 font-semibold">{proxima.reservasDia} turnos</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3 font-medium">Sin fechas láser programadas</p>
          )}
        </div>

        {/* Pendientes de seña */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Pendientes de seña</p>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-3">{pendientes}</p>
        </div>

      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onNavigate('agenda')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.98] transition-all shadow-sm"
        >
          <span>Ver agenda completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('precios')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
        >
          <DollarSign className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
          <span>Gestionar precios</span>
        </button>
      </div>

      {/* Lista de Próximos Turnos */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-bold text-sm text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Próximos turnos a atender
          </h2>
        </div>

        {proximos.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">No hay turnos próximos agendados.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
            {proximos.map((r) => (
              <li key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-zinc-100 truncate">{r.cliente_nombre}</p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">{renderDetalleReserva(r)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-700 dark:text-zinc-300">{renderFechaHora(r.fecha_hora_inicio)}</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">{r.codigo_unico}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}