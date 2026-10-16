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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Citas de hoy
            </p>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {hoy.length}
            </p>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              agendadas
            </span>
          </div>
        </div>

        {/* Próxima jornada láser */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Próxima jornada láser
            </p>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {proxima?.fecha ? (
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight">
                  {proxima.ocupacionPct}%
                </p>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {proxima.reservasDia} turnos
                </span>
              </div>
              
              {/* Barra de Progresión de Ocupación */}
              <div className="w-full bg-purple-100 dark:bg-purple-950/60 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(proxima.ocupacionPct, 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-1.5">
                Fecha: <span className="font-semibold text-slate-700 dark:text-zinc-200">{proxima.fecha}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-4 font-medium">
              Sin fechas láser programadas
            </p>
          )}
        </div>

        {/* Pendientes de seña */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-2xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Pendientes de seña
            </p>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-500 tracking-tight">
              {pendientes}
            </p>
            <span className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80">
              por confirmar
            </span>
          </div>
        </div>

      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('agenda')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl sm:rounded-2xl active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
        >
          <span>Ver agenda completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('precios')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
        >
          <DollarSign className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Gestionar precios</span>
        </button>
      </div>

      {/* Lista de Próximos Turnos (Diseño Flotante Moderno) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Próximos turnos a atender
          </h2>
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            {proximos.length} agendados
          </span>
        </div>

        {proximos.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              No hay turnos próximos agendados.
            </p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-zinc-800/60">
            {proximos.map((r) => {
              // Avatares de iniciales para mantener consistencia con la Agenda
              const iniciales = (r.cliente_nombre || 'CL')
                .trim()
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={r.id}
                  className="py-3 px-3 sm:px-4 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {iniciales}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                        />
                        <p className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {r.cliente_nombre}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                        {renderDetalleReserva(r)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {renderFechaHora(r.fecha_hora_inicio)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                      #{r.codigo_unico}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}