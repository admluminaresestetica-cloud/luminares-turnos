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
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Fecha jornada
              </label>
              <input
                type="date"
                value={fechaVista}
                onChange={(e) => setFechaVista(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                {tipoJornada === 'laser' ? (
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                )}
                Tipo
              </label>
              <select
                value={tipoJornada}
                onChange={(e) => setTipoJornada(e.target.value as 'laser' | 'general')}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              >
                <option value="laser">Láser</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {jornadaCerrada ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3.5 py-2 rounded-xl font-medium border border-gray-200">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                  Jornada cerrada
                </span>
                <button
                  type="button"
                  onClick={handleDesbloquear}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  <Unlock className="w-3.5 h-3.5 text-gray-500" />
                  Desbloquear
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCerrarJornada}
                disabled={cerrando}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                {cerrando ? 'Cerrando...' : 'Cerrar jornada del día'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            <strong className="text-gray-800 font-semibold">{delDiaTipo.length}</strong> turnos {tipoJornada} · <strong className="text-emerald-600 font-semibold">{delDiaTipo.filter((r) => r.estado !== 'cancelado').length}</strong> activos
          </span>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Barra superior de filtros y búsqueda */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/30">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Buscar por nombre, celular, código (#7842) o fecha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto shrink-0 border border-gray-200/50">
            <button
              type="button"
              onClick={() => setVista('proximos')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                vista === 'proximos'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-xs font-medium">No se encontraron reservas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-100">
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
              <tbody className="divide-y divide-gray-100">
                {filtradas.map((r) => {
                  const cerrada = isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-rose-50/30 transition-colors ${cerrada ? 'bg-gray-50/50 opacity-75' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            r.fue_modificado ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-700">{r.codigo_unico}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{r.cliente_nombre}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{r.cliente_celular}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">
                        {renderFechaHora(r.fecha_hora_inicio)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate" title={renderDetalleReserva(r)}>
                        {renderDetalleReserva(r)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.medio_pago || ''}
                          onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-rose-200 focus:outline-none max-w-[110px]"
                        >
                          <option value="">—</option>
                          {MEDIOS_PAGO.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado_asistencia || 'pendiente'}
                          onChange={(e) => handleCampo(r.id, { estado_asistencia: e.target.value as typeof r.estado_asistencia })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                        >
                          {ESTADOS_ASISTENCIA.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado}
                          onChange={(e) => handleCampo(r.id, { estado: e.target.value as typeof r.estado })}
                          disabled={cerrada}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-rose-200 focus:outline-none font-medium"
                        >
                          {ESTADOS_RESERVA.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditReserva(r)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
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