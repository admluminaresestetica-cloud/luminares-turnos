// src/app/admin/turnos/components/AgendaPanel.tsx
'use client';

import { useMemo, useState } from 'react';
import { 
  Search, 
  Calendar, 
  Lock, 
  Unlock, 
  Edit3, 
  Clock, 
  History, 
  Sparkles, 
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

export default function AgendaPanel({
  reservas,
  cierres,
  configLaser,
  configGeneral,
  onReservaUpdated,
  onCierresChanged,
}: Props) {
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
  <div className="space-y-6">
    {/* Control de Jornada / Cierre */}
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Controles de Selección de Fecha y Tipo */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex-1 min-w-[150px] md:flex-none">
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Fecha jornada
            </label>
            <input
              type="date"
              value={fechaVista}
              onChange={(e) => setFechaVista(e.target.value)}
              className="w-full border border-slate-200 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-zinc-100 bg-slate-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          <div className="flex-1 min-w-[130px] md:flex-none">
            <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              {tipoJornada === 'laser' ? (
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Scissors className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              )}
              Tipo
            </label>
            <select
              value={tipoJornada}
              onChange={(e) => setTipoJornada(e.target.value as 'laser' | 'general')}
              className="w-full border border-slate-200 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-zinc-100 bg-slate-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="laser" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Láser</option>
              <option value="general" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">General</option>
            </select>
          </div>
        </div>

        {/* Acciones de Estado de Jornada */}
        <div className="flex items-center gap-2 self-stretch md:self-auto w-full md:w-auto pt-1 md:pt-0">
          {jornadaCerrada ? (
            <>
              <span className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-2xl font-semibold border border-amber-500/20 select-none">
                <Lock className="w-3.5 h-3.5" />
                Jornada cerrada
              </span>
              <button
                type="button"
                onClick={handleDesbloquear}
                className="flex-1 md:flex-none min-h-[42px] inline-flex items-center justify-center gap-2 text-xs px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl font-semibold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/60 active:scale-95 select-none transition-all shadow-xs"
              >
                <Unlock className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                Desbloquear
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCerrarJornada}
              disabled={cerrando}
              className="w-full md:w-auto min-h-[42px] justify-center inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl disabled:opacity-50 disabled:active:scale-100 active:scale-95 select-none transition-all shadow-md shadow-blue-500/10"
            >
              <Lock className="w-3.5 h-3.5" />
              {cerrando ? 'Cerrando...' : 'Cerrar jornada del día'}
            </button>
          )}
        </div>
      </div>

      {/* Resumen Informativo */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <strong className="text-slate-800 dark:text-zinc-200 font-bold">{delDiaTipo.length}</strong> turnos {tipoJornada}
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
            {delDiaTipo.filter((r) => r.estado !== 'cancelado').length}
          </strong> activos
        </span>
      </div>
    </div>

    {/* Contenedor Principal de Reservas */}
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
      {/* Barra superior de filtros y búsqueda */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-slate-50/40 dark:bg-zinc-900/40">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Buscar por nombre, celular, código (#7842) o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-zinc-700/80 rounded-2xl text-xs bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Switch Proximos / Historial */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setVista('proximos')}
            className={`flex-1 sm:flex-initial min-h-[38px] sm:min-h-0 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 select-none ${
              vista === 'proximos'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Próximos
          </button>
          <button
            type="button"
            onClick={() => setVista('historial')}
            className={`flex-1 sm:flex-initial min-h-[38px] sm:min-h-0 flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 select-none ${
              vista === 'historial'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial
          </button>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
          </div>
          <p className="text-slate-600 dark:text-zinc-400 text-xs font-medium">
            No se encontraron reservas con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* Tarjetas Flotantes */}
          <div className="flex flex-col gap-3.5">
            {filtradas.map((r) => {
              const cerrada = isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
              const { iniciales, colorClass } = getAvatarInfo(r.cliente_nombre);
              const detalleTexto = renderDetalleReserva(r);
              const numCelularLimpio = r.cliente_celular ? r.cliente_celular.replace(/\D/g, '') : '';

              return (
                <div
                  key={r.id}
                  className={`bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    cerrada ? 'opacity-70 bg-slate-50/50 dark:bg-zinc-800/30' : ''
                  }`}
                >
                  {/* Avatar, Info del cliente y servicio */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${colorClass}`}>
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
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {r.cliente_nombre || 'Sin nombre'}
                        </h4>
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
                      <select
                        value={r.medio_pago || ''}
                        onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                        disabled={cerrada}
                        className="text-xs border border-slate-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
                        title="Medio de pago"
                      >
                        <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">— Pago —</option>
                        {MEDIOS_PAGO.map((m) => (
                          <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{m.label}</option>
                        ))}
                      </select>

                      {/* Selector Asistencia */}
                      <select
                        value={r.estado_asistencia || 'pendiente'}
                        onChange={(e) => handleCampo(r.id, { estado_asistencia: e.target.value as typeof r.estado_asistencia })}
                        disabled={cerrada}
                        className="text-xs border border-slate-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
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
                        className="text-xs border border-slate-200 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-bold"
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
                        <a
                          href={`https://wa.me/${numCelularLimpio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-all active:scale-90"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditReserva(r)}
                        className="text-xs bg-slate-100 dark:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95 flex items-center gap-1.5"
                        title="Editar reserva"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

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
  </div>
);
}