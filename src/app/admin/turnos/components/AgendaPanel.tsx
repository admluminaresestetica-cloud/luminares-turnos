// src/app/admin/turnos/components/AgendaPanel.tsx
'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Lock, 
  Unlock, 
  Edit3, 
  Clock, 
  History, 
  PencilLine, 
  Scissors,
  AlertCircle,
  CreditCard,
  Phone,
  MessageCircle
} from 'lucide-react';
import type { CierreJornada, ConfiguracionCalendario, Reserva } from '@/lib/types';
import { matchBusqueda, renderDetalleReserva, renderFechaHora } from '@/lib/admin/helpers';
import { fechaDeReserva } from '@/lib/admin/validacion';
import { actualizarCampoReserva } from '@/lib/supabase/admin/reservas';
import {
  calcularArqueo,
  cerrarJornada,
  desbloquearJornada,
  isJornadaCerrada,
} from '@/lib/supabase/admin/cierres';
import { ESTADOS_ASISTENCIA, ESTADOS_RESERVA, MEDIOS_PAGO } from '@/lib/admin/constants';
import ModalEditarReserva from './ModalEditarReserva';
import { supabase } from '@/lib/supabase';

type VistaAgenda = 'proximos' | 'historial';

interface Props {
  reservas: Reserva[];
  cierres: CierreJornada[];
  configLaser: ConfiguracionCalendario | null;
  configGeneral: ConfiguracionCalendario | null;
  onReservaUpdated: (r: Reserva) => void;
  onCierresChanged: () => void;
}

// ✨ Variantes de animación (solo UI)
const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.03 },
  },
};

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

// Helper para generar iniciales y color de avatar estilo "PR"
function getAvatarInfo(nombre?: string) {
  const limpio = (nombre || 'Cliente').trim();
  const partes = limpio.split(' ');
  const iniciales = partes.length > 1 
    ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() 
    : limpio.slice(0, 2).toUpperCase();

  const colores = [
    'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
  ];
  const index = limpio.charCodeAt(0) % colores.length;
  return { iniciales, colorClass: colores[index] };
}

// Estilo común de los selectores nativos (solo UI)
const claseSelect =
  'text-xs border border-slate-200 dark:border-zinc-700/80 rounded-xl py-1.5 bg-white/90 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-pointer font-medium hover:border-blue-300 dark:hover:border-zinc-600';

export default function AgendaPanel({
  reservas,
  cierres,
  configLaser,
  configGeneral,
  onReservaUpdated,
  onCierresChanged,
}: Props) {
  const reducirMovimiento = useReducedMotion();
  const [vista, setVista] = useState<VistaAgenda>('proximos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaVista, setFechaVista] = useState(() => {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  });
  const [tipoJornada, setTipoJornada] = useState<'laser' | 'general'>('laser');
  const [editReserva, setEditReserva] = useState<Reserva | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const filtradas = useMemo(() => {
    const ahora = Date.now();
    return reservas.filter((r) => {
      if (!matchBusqueda(r, busqueda)) return false;
      const ts = new Date(r.fecha_hora_inicio).getTime();
      if (vista === 'proximos') return ts >= ahora;
      return ts < ahora;
    });
  }, [reservas, busqueda, vista]);

  const delDia = useMemo(
    () => reservas.filter((r) => fechaDeReserva(r.fecha_hora_inicio) === fechaVista),
    [reservas, fechaVista]
  );

  const delDiaTipo = delDia.filter((r) => r.servicio_tipo === tipoJornada);
  const jornadaCerrada = isJornadaCerrada(fechaVista, tipoJornada, cierres);
  const configActiva = tipoJornada === 'laser' ? configLaser : configGeneral;

  // Solo UI: dato derivado para el resumen de la jornada
  const canceladasDia = delDiaTipo.filter((r) => r.estado === 'cancelado').length;

  const handleCampo = async (id: string, campos: Parameters<typeof actualizarCampoReserva>[1]) => {
    const ok = await actualizarCampoReserva(id, campos);
    if (ok) {
      const r = reservas.find((x) => x.id === id);
      if (r) onReservaUpdated({ ...r, ...campos, fue_modificado: true });
    }
  };

  const handleCerrarJornada = async () => {
    if (!confirm(`¿Cerrar jornada ${tipoJornada} del ${fechaVista}? Los turnos quedarán en solo lectura.`)) return;
    setCerrando(true);

    const { data: { user } } = await supabase.auth.getUser();
    const arqueo = calcularArqueo(reservas, fechaVista, tipoJornada);
    const cierre = await cerrarJornada(
      fechaVista,
      tipoJornada,
      arqueo.total,
      arqueo.desglose,
      user?.email ?? 'admin'
    );

    setCerrando(false);
    if (cierre) {
      onCierresChanged();
      alert(`Jornada cerrada. Total recaudado: $${arqueo.total.toLocaleString('es-AR')}`);
    } else {
      alert('Error al cerrar la jornada. ¿Ya fue cerrada?');
    }
  };

  const handleDesbloquear = async () => {
    if (!confirm('¿Desbloquear esta jornada para permitir ediciones?')) return;
    const ok = await desbloquearJornada(fechaVista, tipoJornada);
    if (ok) onCierresChanged();
    else alert('Error al desbloquear');
  };

return (
  <motion.div
    variants={contenedorVariants}
    initial="hidden"
    animate="show"
    className="space-y-6"
  >
    {/* Control de Jornada / Cierre */}
    <motion.div
      variants={seccionVariants}
      className="relative overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[28px] border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xl transition-colors"
    >
      {/* Resplandor decorativo (cambia de color según el tipo de jornada) */}
      <span
        className={`pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl transition-colors duration-500 ${
          tipoJornada === 'laser' ? 'bg-blue-500/15' : 'bg-amber-400/15'
        }`}
      />

      <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        {/* Controles de Selección de Fecha y Tipo */}
        <div className="flex flex-wrap items-end gap-3 w-full md:w-auto">
          <div className="flex-1 min-w-[150px] md:flex-none">
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Fecha jornada
            </label>
            <input
              type="date"
              value={fechaVista}
              onChange={(e) => setFechaVista(e.target.value)}
              className="w-full border border-slate-200 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-zinc-100 bg-slate-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Tipo de jornada: control segmentado con indicador deslizante */}
          <div className="flex-1 min-w-[190px] md:flex-none">
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              {tipoJornada === 'laser' ? (
                <PencilLine className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Scissors className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              )}
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
              {(['laser', 'general'] as const).map((tipo) => {
                const activo = tipoJornada === tipo;
                return (
                  <motion.button
                    key={tipo}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setTipoJornada(tipo)}
                    aria-pressed={activo}
                    className={`relative py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer select-none ${
                      activo
                        ? tipo === 'laser'
                          ? 'text-blue-600 dark:text-blue-300'
                          : 'text-amber-600 dark:text-amber-300'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {activo && (
                      <motion.span
                        layoutId="agenda-tipo-jornada"
                        transition={reducirMovimiento ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-zinc-700"
                      />
                    )}
                    <span className="relative z-10">{tipo === 'laser' ? 'Láser' : 'General'}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Acciones de Estado de Jornada */}
        <div className="flex items-center gap-2 self-stretch md:self-auto w-full md:w-auto pt-1 md:pt-0">
          <AnimatePresence mode="wait" initial={false}>
            {jornadaCerrada ? (
              <motion.div
                key="cerrada"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <span className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-2xl font-semibold border border-amber-500/20 select-none">
                  <Lock className="w-3.5 h-3.5" />
                  Jornada cerrada
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleDesbloquear}
                  className="flex-1 md:flex-none min-h-[42px] inline-flex items-center justify-center gap-2 text-xs px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl font-semibold text-slate-700 dark:text-zinc-200 bg-white/90 dark:bg-zinc-800/90 hover:bg-slate-50 dark:hover:bg-zinc-700/60 select-none transition-colors shadow-xs cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  Desbloquear
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="abierta"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full md:w-auto"
              >
                <motion.button
                  whileTap={cerrando ? undefined : { scale: 0.95 }}
                  whileHover={reducirMovimiento || cerrando ? undefined : { y: -2 }}
                  type="button"
                  onClick={handleCerrarJornada}
                  disabled={cerrando}
                  className="w-full md:w-auto min-h-[42px] justify-center inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white rounded-2xl disabled:opacity-50 select-none transition-colors shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  {cerrando ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  {cerrando ? 'Cerrando...' : 'Cerrar jornada del día'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Resumen Informativo */}
      <div className="relative mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 font-semibold">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <motion.strong
            key={delDiaTipo.length}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="text-slate-800 dark:text-zinc-200 font-black tabular-nums"
          >
            {delDiaTipo.length}
          </motion.strong>
          turnos {tipoJornada}
        </span>

        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <motion.strong
            key={delDiaTipo.length - canceladasDia}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="font-black tabular-nums"
          >
            {delDiaTipo.filter((r) => r.estado !== 'cancelado').length}
          </motion.strong>
          activos
        </span>

        <AnimatePresence>
          {canceladasDia > 0 && (
            <motion.span
              key="canceladas"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 font-semibold text-rose-700 dark:text-rose-400"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              <strong className="font-black tabular-nums">{canceladasDia}</strong>
              {canceladasDia === 1 ? 'cancelado' : 'cancelados'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* Contenedor Principal de Reservas */}
    <motion.div
      variants={seccionVariants}
      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[28px] border border-slate-200/80 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors"
    >
      {/* Barra superior de filtros y búsqueda */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-slate-50/40 dark:bg-zinc-900/40">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Buscar por nombre, celular, código (#7842) o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-2xl text-xs bg-white/90 dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Switch Proximos / Historial con indicador deslizante */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
          {([
            { id: 'proximos', label: 'Próximos', icono: Clock },
            { id: 'historial', label: 'Historial', icono: History },
          ] as const).map((op) => {
            const Icono = op.icono;
            const activo = vista === op.id;
            return (
              <motion.button
                key={op.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setVista(op.id)}
                aria-pressed={activo}
                className={`relative flex-1 sm:flex-initial min-h-[38px] sm:min-h-0 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors select-none cursor-pointer ${
                  activo
                    ? 'text-blue-600 dark:text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activo && (
                  <motion.span
                    layoutId="agenda-vista-activa"
                    transition={reducirMovimiento ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-zinc-700"
                  />
                )}
                <Icono className="relative z-10 w-3.5 h-3.5" />
                <span className="relative z-10">{op.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
          </div>
          <p className="text-slate-600 dark:text-zinc-400 text-xs font-medium">
            No se encontraron reservas con los filtros seleccionados.
          </p>
        </motion.div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* Tarjetas Flotantes (la lista se re-anima al cambiar entre Próximos / Historial) */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={vista}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex flex-col gap-3.5"
            >
            {filtradas.map((r, idx) => {
              const cerrada = isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
              const { iniciales, colorClass } = getAvatarInfo(r.cliente_nombre);
              const detalleTexto = renderDetalleReserva(r);
              const numCelularLimpio = r.cliente_celular ? r.cliente_celular.replace(/\D/g, '') : '';
              const cancelada = r.estado === 'cancelado';

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 26,
                    // Retraso acotado: las listas largas no se vuelven lentas
                    delay: Math.min(idx, 10) * 0.04,
                  }}
                  whileHover={reducirMovimiento ? undefined : { y: -2 }}
                  className={`group relative overflow-hidden bg-white/90 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 hover:border-blue-300 dark:hover:border-blue-800/60 rounded-2xl p-4 sm:p-5 pl-5 sm:pl-6 shadow-md hover:shadow-xl transition-[box-shadow,border-color,opacity] duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    cerrada ? 'opacity-70 bg-slate-50/50 dark:bg-zinc-800/30' : ''
                  }`}
                >
                  {/* Barra lateral de estado */}
                  <span
                    className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                      cancelada
                        ? 'bg-rose-500'
                        : cerrada
                        ? 'bg-slate-300 dark:bg-zinc-600'
                        : 'bg-blue-500'
                    }`}
                  />

                  {/* Avatar, Info del cliente y servicio */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${colorClass}`}>
                      {iniciales}
                    </div>

                    <div className="flex flex-col min-w-0 gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-700/80 px-2 py-0.5 rounded-lg">
                          #{r.codigo_unico || '-'}
                        </span>
                        <h4 className={`text-sm font-black tracking-tight text-slate-900 dark:text-zinc-100 truncate ${cancelada ? 'line-through decoration-rose-400/70 opacity-70' : ''}`}>
                          {r.cliente_nombre || 'Sin nombre'}
                        </h4>
                        {cerrada && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <Lock className="w-2.5 h-2.5" />
                            Cerrada
                          </span>
                        )}
                      </div>

                      {/* Teléfono y Fecha */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
                        {r.cliente_celular && (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {r.cliente_celular}
                          </span>
                        )}
                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {renderFechaHora(r.fecha_hora_inicio)}
                        </span>
                      </div>

                      {/* Detalle del servicio */}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-xl font-medium max-w-md truncate border border-slate-200/50 dark:border-zinc-800"
                          title={detalleTexto}
                        >
                          <Scissors className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          {detalleTexto}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones y Selectores */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 pt-3 md:pt-0 border-t border-slate-100 dark:border-zinc-700/50 md:border-t-0 shrink-0 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Selector Medio de Pago */}
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <select
                          value={r.medio_pago || ''}
                          onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                          disabled={cerrada}
                          className={`${claseSelect} pl-8 pr-2.5`}
                          title="Medio de pago"
                        >
                          <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">— Pago —</option>
                          {MEDIOS_PAGO.map((m) => (
                            <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{m.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Selector Asistencia */}
                      <select
                        value={r.estado_asistencia || 'pendiente'}
                        onChange={(e) => handleCampo(r.id, { estado_asistencia: e.target.value as typeof r.estado_asistencia })}
                        disabled={cerrada}
                        className={`${claseSelect} px-2.5`}
                        title="Estado de asistencia"
                      >
                        {ESTADOS_ASISTENCIA.map((e) => (
                          <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{e.label}</option>
                        ))}
                      </select>

                      {/* Selector Estado */}
                      <select
                        value={r.estado}
                        onChange={(e) => handleCampo(r.id, { estado: e.target.value as typeof r.estado })}
                        disabled={cerrada}
                        className={`${claseSelect} px-2.5 font-bold ${cancelada ? 'text-rose-600 dark:text-rose-400' : ''}`}
                        title="Estado de reserva"
                      >
                        {ESTADOS_RESERVA.map((e) => (
                          <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{e.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-1.5">
                      {numCelularLimpio && (
                        <motion.a
                          whileTap={{ scale: 0.9 }}
                          whileHover={reducirMovimiento ? undefined : { y: -2 }}
                          href={`https://wa.me/${numCelularLimpio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </motion.a>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={reducirMovimiento ? undefined : { y: -2 }}
                        type="button"
                        onClick={() => setEditReserva(r)}
                        className="text-xs bg-slate-100 dark:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 px-3 py-1.5 rounded-xl font-bold hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Editar reserva"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>

    {/* Modal de edición */}
    {editReserva && configActiva && (
      <ModalEditarReserva
        reserva={editReserva}
        reservas={reservas}
        configCalendario={configActiva}
        readonly={isJornadaCerrada(fechaDeReserva(editReserva.fecha_hora_inicio), editReserva.servicio_tipo, cierres)}
        onClose={() => setEditReserva(null)}
        onSaved={onReservaUpdated}
      />
    )}
  </motion.div>
);
}