// src/components/admin/AgendaPanel.tsx
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
  CheckCircle2,
  AlertCircle
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

  const ahora = Date.now();

  const filtradas = useMemo(() => {
    return reservas.filter((r) => {
      if (!matchBusqueda(r, busqueda)) return false;
      const ts = new Date(r.fecha_hora_inicio).getTime();
      if (vista === 'proximos') return ts >= ahora;
      return ts < ahora;
    });
  }, [reservas, busqueda, vista, ahora]);

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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Fecha jornada
              </label>
              <input
                type="date"
                value={fechaVista}
                onChange={(e) => setFechaVista(e.target.value)}
                className="border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 dark:text-zinc-100 bg-gray-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              />
            </div>

            <div>
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
                className="border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 dark:text-zinc-100 bg-gray-50/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
              >
                <option value="laser" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">Láser</option>
                <option value="general" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">General</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {jornadaCerrada ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-3.5 py-2 rounded-xl font-medium border border-gray-200 dark:border-zinc-700">
                  <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                  Jornada cerrada
                </span>
                <button
                  type="button"
                  onClick={handleDesbloquear}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-all"
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
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-gray-800 dark:hover:bg-white disabled:opacity-50 transition-all shadow-sm"
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 transition-all"
            />
          </div>

          <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-xl w-full sm:w-auto shrink-0 border border-gray-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => setVista('proximos')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha / Hora</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Medio Pago</th>
                  <th className="px-4 py-3">Asistencia</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {filtradas.map((r) => {
                  const cerrada = isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors ${cerrada ? 'bg-gray-50/50 dark:bg-zinc-800/30 opacity-75' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-700 dark:text-zinc-300">{r.codigo_unico}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 dark:text-zinc-100">{r.cliente_nombre}</div>
                        <div className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">{r.cliente_celular}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-zinc-300 font-medium">
                        {renderFechaHora(r.fecha_hora_inicio)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-zinc-300 max-w-[150px] truncate" title={renderDetalleReserva(r)}>
                        {renderDetalleReserva(r)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.medio_pago || ''}
                          onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50 disabled:text-gray-400 dark:disabled:text-zinc-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none max-w-[110px]"
                        >
                          <option value="" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">—</option>
                          {MEDIOS_PAGO.map((m) => (
                            <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{m.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado_asistencia || 'pendiente'}
                          onChange={(e) => handleCampo(r.id, { estado_asistencia: e.target.value as typeof r.estado_asistencia })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50 disabled:text-gray-400 dark:disabled:text-zinc-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none"
                        >
                          {ESTADOS_ASISTENCIA.map((e) => (
                            <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado}
                          onChange={(e) => handleCampo(r.id, { estado: e.target.value as typeof r.estado })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 disabled:bg-gray-100 dark:disabled:bg-zinc-800/50 disabled:text-gray-400 dark:disabled:text-zinc-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 focus:outline-none font-medium"
                        >
                          {ESTADOS_RESERVA.map((e) => (
                            <option key={e.value} value={e.value} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditReserva(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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