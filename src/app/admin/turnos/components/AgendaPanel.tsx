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
    <div className="space-y-5">
      {/* Control de Jornada / Cierre */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 min-w-[140px] md:flex-none">
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Fecha jornada
              </label>
              <input
                type="date"
                value={fechaVista}
                onChange={(e) => setFechaVista(e.target.value)}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 sm:py-2.5 text-xs font-medium text-gray-800 dark:text-zinc-100 bg-gray-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="flex-1 min-w-[120px] md:flex-none">
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                {tipoJornada === 'laser' ? (
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                ) : (
                  <Scissors className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                )}
                Tipo
              </label>
              <select
                value={tipoJornada}
                onChange={(e) => setTipoJornada(e.target.value as 'laser' | 'general')}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 sm:py-2.5 text-xs font-medium text-gray-800 dark:text-zinc-100 bg-gray-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              >
                <option value="laser" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">Láser</option>
                <option value="general" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">General</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto w-full md:w-auto">
            {jornadaCerrada ? (
              <>
                <span className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-3.5 py-3 sm:py-2.5 rounded-xl font-medium border border-gray-200 dark:border-zinc-700 select-none">
                  <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                  Jornada cerrada
                </span>
                <button
                  type="button"
                  onClick={handleDesbloquear}
                  className="flex-1 md:flex-none min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs px-3.5 py-3 sm:py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white active:scale-95 select-none transition-all"
                >
                  <Unlock className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                  Desbloquear
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCerrarJornada}
                disabled={cerrando}
                className="w-full md:w-auto min-h-[44px] justify-center inline-flex items-center gap-2 text-xs font-semibold px-4 py-3 sm:py-2.5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-gray-800 dark:hover:bg-white disabled:opacity-50 disabled:active:scale-100 active:scale-95 select-none transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                {cerrando ? 'Cerrando...' : 'Cerrar jornada del día'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
          <span>
            <strong className="text-gray-800 dark:text-zinc-200 font-semibold">{delDiaTipo.length}</strong> turnos {tipoJornada} · <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{delDiaTipo.filter((r) => r.estado !== 'cancelado').length}</strong> activos
          </span>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
        {/* Barra superior de filtros y búsqueda */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/30 dark:bg-zinc-900/50">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Buscar por nombre, celular, código (#7842) o fecha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-3 sm:py-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
            />
          </div>

          <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl w-full sm:w-auto shrink-0 border border-gray-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => setVista('proximos')}
              className={`flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 select-none ${
                vista === 'proximos'
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Próximos
            </button>
            <button
              type="button"
              onClick={() => setVista('historial')}
              className={`flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 select-none ${
                vista === 'historial'
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-zinc-400 text-xs font-medium">No se encontraron reservas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {/* LISTA DE TARJETAS FLOTANTES MODERNAS */}
            <div className="flex flex-col gap-3.5">
              {filtradas.map((r) => {
                const cerrada = isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
                const { iniciales, colorClass } = getAvatarInfo(r.cliente_nombre);
                const detalleTexto = renderDetalleReserva(r);
                const numCelularLimpio = r.cliente_celular ? r.cliente_celular.replace(/\D/g, '') : '';

                return (
                  <div
                    key={r.id}
                    className={`bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      cerrada ? 'opacity-75 bg-gray-50/50 dark:bg-zinc-800/30' : ''
                    }`}
                  >
                    {/* IZQUIERDA: Avatar con iniciales, Código, Nombre, Celular, Fecha y Servicio */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${colorClass}`}>
                        {iniciales}
                      </div>

                      <div className="flex flex-col min-w-0 gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'}`} title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'} />
                          <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md dark:bg-zinc-700 dark:text-zinc-400">
                            #{r.codigo_unico || '-'}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                            {r.cliente_nombre || 'Sin nombre'}
                          </h4>
                        </div>

                        {/* Teléfono y Fecha */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 flex-wrap">
                          {r.cliente_celular && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {r.cliente_celular}
                            </span>
                          )}
                          <span className="text-gray-300 dark:text-zinc-600">•</span>
                          <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            {renderFechaHora(r.fecha_hora_inicio)}
                          </span>
                        </div>

                        {/* Detalle del servicio */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg font-medium max-w-md truncate" title={detalleTexto}>
                            <Scissors className="w-3 h-3 text-rose-500 shrink-0" />
                            {detalleTexto}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DERECHA: Selectores de Medio de pago, Asistencia, Estado y Botón Editar */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-gray-100 dark:border-zinc-700/50 md:border-t-0 shrink-0 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Selector Medio de Pago */}
                        <select
                          value={r.medio_pago || ''}
                          onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none transition-all cursor-pointer font-medium"
                          title="Medio de pago"
                        >
                          <option value="" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">— Pago —</option>
                          {MEDIOS_PAGO.map((m) => (
                            <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{m.label}</option>
                          ))}
                        </select>

                        {/* Selector Asistencia */}
                        <select
                          value={r.estado_asistencia || 'pendiente'}
                          onChange={(e) => handleCampo(r.id, { estado_asistencia: e.target.value as typeof r.estado_asistencia })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none transition-all cursor-pointer font-medium"
                          title="Estado de asistencia"
                        >
                          {ESTADOS_ASISTENCIA.map((e) => (
                            <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{e.label}</option>
                          ))}
                        </select>

                        {/* Selector Estado */}
                        <select
                          value={r.estado}
                          onChange={(e) => handleCampo(r.id, { estado: e.target.value as typeof r.estado })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:opacity-50 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none transition-all cursor-pointer font-bold"
                          title="Estado de reserva"
                        >
                          {ESTADOS_RESERVA.map((e) => (
                            <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{e.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Botón WhatsApp & Editar */}
                      <div className="flex items-center gap-1.5">
                        {numCelularLimpio && (
                          <a
                            href={`https://wa.me/${numCelularLimpio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition-all active:scale-90"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditReserva(r)}
                          className="text-xs bg-gray-100 text-gray-800 px-3 py-2 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 dark:bg-zinc-700 dark:text-zinc-200 flex items-center gap-1"
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