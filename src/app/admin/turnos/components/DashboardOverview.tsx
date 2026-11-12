'use client';

import { useMemo } from 'react';
import { Calendar, AlertCircle, Sparkles, ArrowRight, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
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

const contenedorVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function DashboardOverview({ reservas, configLaser, onNavigate }: Props) {
  const reducirMovimiento = useReducedMotion();

  // Memoizamos el cálculo de métricas para optimizar rendimiento
  const hoy = useMemo(() => citasHoy(reservas), [reservas]);
  const pendientes = useMemo(() => pendientesSena(reservas), [reservas]);
  const proxima = useMemo(() => proximaJornadaLaser(reservas, configLaser), [reservas, configLaser]);
  const proximos = useMemo(() => proximosTurnos(reservas), [reservas]);

  return (
    <motion.div
      variants={contenedorVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Tarjetas de Métricas Principal */}
      <motion.div variants={seccionVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Citas de hoy */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={reducirMovimiento ? undefined : { y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 shadow-xl hover:shadow-2xl transition-shadow group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Citas de hoy
            </p>
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <motion.p
              key={hoy.length}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-100 tracking-tight tabular-nums"
            >
              {hoy.length}
            </motion.p>
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
              agendadas
            </span>
          </div>
        </motion.div>

        {/* Próxima jornada láser */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={reducirMovimiento ? undefined : { y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 shadow-xl hover:shadow-2xl transition-shadow group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Próxima jornada láser
            </p>
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          {proxima?.fecha ? (
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <motion.p
                  key={proxima.ocupacionPct}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 tracking-tight tabular-nums"
                >
                  {proxima.ocupacionPct}%
                </motion.p>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 tabular-nums">
                  {proxima.reservasDia} turnos
                </span>
              </div>
              
              {/* Barra de Progresión de Ocupación */}
              <div className="w-full bg-purple-100 dark:bg-purple-950/60 rounded-full h-1.5 mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(proxima.ocupacionPct, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="bg-purple-600 h-1.5 rounded-full"
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-1.5">
                Fecha: <span className="font-semibold text-slate-700 dark:text-zinc-200">{proxima.fecha}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-4 font-medium">
              Sin fechas láser programadas
            </p>
          )}
        </motion.div>

        {/* Pendientes de seña */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={reducirMovimiento ? undefined : { y: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 shadow-xl hover:shadow-2xl transition-shadow group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Pendientes de seña
            </p>
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <motion.p
              key={pendientes}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500 tracking-tight tabular-nums"
            >
              {pendientes}
            </motion.p>
            <span className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80">
              por confirmar
            </span>
          </div>
        </motion.div>

      </motion.div>

      {/* Botones de acción rápida */}
      <motion.div variants={seccionVariants} className="flex flex-wrap items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={reducirMovimiento ? undefined : { y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          type="button"
          onClick={() => onNavigate('agenda')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl sm:rounded-2xl shadow-md shadow-blue-500/25 cursor-pointer"
        >
          <span>Ver agenda completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={reducirMovimiento ? undefined : { y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          type="button"
          onClick={() => onNavigate('precios')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm cursor-pointer"
        >
          <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Gestionar precios</span>
        </motion.button>
      </motion.div>

      {/* Lista de Próximos Turnos (Diseño Flotante Moderno) */}
      <motion.div variants={seccionVariants} className="rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl overflow-hidden transition-all">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-black text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
            <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            Próximos turnos a atender
          </h2>
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold tabular-nums">
            {proximos.length} agendados
          </span>
        </div>

        {proximos.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
              No hay turnos próximos agendados.
            </p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 flex flex-col gap-2.5">
            {proximos.map((r, idx) => {
              const fechaObj = r.fecha_hora_inicio ? new Date(r.fecha_hora_inicio) : null;
              const mesStr = fechaObj ? fechaObj.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase() : 'FECHA';
              const diaStr = fechaObj ? fechaObj.getDate() : '--';

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26, delay: Math.min(idx, 10) * 0.04 }}
                  whileHover={reducirMovimiento ? undefined : { scale: 1.005, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative overflow-hidden pl-5 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 hover:border-slate-200 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                >
                  {/* Barra lateral de estado */}
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-500 shadow-xs" />

                  {/* IZQUIERDA: Bloque Fecha Calendario + Datos del Cliente y Servicio */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Recuadro Estilo Calendario */}
                    <div className="w-11 h-11 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/60 dark:border-zinc-700/50 flex flex-col items-center justify-center shrink-0 select-none">
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase leading-none">
                        {mesStr}
                      </span>
                      <span className="text-base font-black text-slate-900 dark:text-zinc-100 leading-none mt-0.5 tabular-nums">
                        {diaStr}
                      </span>
                    </div>

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {r.cliente_nombre || 'Sin nombre'}
                        </p>
                        
                        <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-500">
                          #{r.codigo_unico}
                        </span>

                        {r.fue_modificado && (
                          <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
                            • Modificado
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate capitalize">
                        {renderDetalleReserva(r)}
                      </p>
                    </div>
                  </div>

                  {/* DERECHA: Hora exacta */}
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-zinc-700/50 tabular-nums">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {renderFechaHora(r.fecha_hora_inicio)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}