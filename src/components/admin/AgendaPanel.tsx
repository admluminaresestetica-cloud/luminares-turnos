'use client';

import { useMemo, useState } from 'react';
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
    <div className="space-y-4">
      {/* Vista diaria + cierre */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fecha jornada</label>
              <input
                type="date"
                value={fechaVista}
                onChange={(e) => setFechaVista(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
              <select
                value={tipoJornada}
                onChange={(e) => setTipoJornada(e.target.value as 'laser' | 'general')}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="laser">Láser</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {jornadaCerrada ? (
              <>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-medium">
                  🔒 Jornada cerrada
                </span>
                <button
                  type="button"
                  onClick={handleDesbloquear}
                  className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Desbloquear
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCerrarJornada}
                disabled={cerrando}
                className="text-sm px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {cerrando ? 'Cerrando...' : '🔒 Cerrar jornada del día'}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          {delDiaTipo.length} turnos {tipoJornada} · {delDiaTipo.filter((r) => r.estado !== 'cancelado').length} activos
        </p>
      </div>

      {/* Filtros lista */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Buscar por nombre, celular, código (#7842) o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setVista('proximos')}
              className={`px-4 py-2 text-sm font-medium ${vista === 'proximos' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
            >
              Próximos
            </button>
            <button
              type="button"
              onClick={() => setVista('historial')}
              className={`px-4 py-2 text-sm font-medium ${vista === 'historial' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
            >
              Historial
            </button>
          </div>
        </div>

        {filtradas.length === 0 ? (
          <p className="p-8 text-center text-slate-500 text-sm">No se encontraron reservas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha/Hora</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Asistencia</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((r) => {
                  const cerrada =
                    isJornadaCerrada(fechaDeReserva(r.fecha_hora_inicio), r.servicio_tipo, cierres);
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 ${cerrada ? 'opacity-75' : ''}`}>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${r.fue_modificado ? 'bg-red-500' : 'bg-emerald-500'}`}
                          title={r.fue_modificado ? 'Modificado por admin' : 'Reserva original'}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.codigo_unico}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.cliente_nombre}</div>
                        <div className="text-xs text-slate-500">{r.cliente_celular}</div>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{renderFechaHora(r.fecha_hora_inicio)}</td>
                      <td className="px-4 py-3 text-xs max-w-[140px] truncate">{renderDetalleReserva(r)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.medio_pago || ''}
                          onChange={(e) => handleCampo(r.id, { medio_pago: e.target.value || null })}
                          disabled={cerrada}
                          className="text-xs border border-slate-200 rounded px-1.5 py-1 disabled:bg-slate-50 max-w-[110px]"
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
                          className="text-xs border border-slate-200 rounded px-1.5 py-1 disabled:bg-slate-50"
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
                          className="text-xs border border-slate-200 rounded px-1.5 py-1 disabled:bg-slate-50"
                        >
                          {ESTADOS_RESERVA.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setEditReserva(r)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                        >
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
