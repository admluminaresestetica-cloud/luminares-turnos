// src/components/admin/tabs/AgendaTab.tsx
'use client'

import ResumenAgenda from '@/components/admin/ResumenAgenda'
import { Reserva, renderDetalle, renderFechaHora } from '../types'

interface AgendaTabProps {
  loading: boolean
  turnosFiltrados: Reserva[]
  turnosAgendaResumen: Reserva[]
  esFechaAgendaPasada: boolean

  busqueda: string
  setBusqueda: (v: string) => void
  filtroFechaTipo: 'todos' | 'hoy' | 'especifica'
  setFiltroFechaTipo: (v: 'todos' | 'hoy' | 'especifica') => void
  fechaEspecifica: string
  setFechaEspecifica: (v: string) => void
  filtroEstado: string
  setFiltroEstado: (v: string) => void

  onNuevoTurno: () => void
  onEditarTurno: (t: Reserva) => void
  onActualizarEstado: (id: string, nuevoEstado: string) => void
}

export default function AgendaTab({
  loading,
  turnosFiltrados,
  turnosAgendaResumen,
  esFechaAgendaPasada,
  busqueda,
  setBusqueda,
  filtroFechaTipo,
  setFiltroFechaTipo,
  fechaEspecifica,
  setFechaEspecifica,
  filtroEstado,
  setFiltroEstado,
  onNuevoTurno,
  onEditarTurno,
  onActualizarEstado
}: AgendaTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Buscar cliente, tel o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none w-full md:w-64 focus:border-black transition"
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroFechaTipo}
            onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Ver solo Hoy</option>
            <option value="especifica">Elegir fecha...</option>
          </select>

          {filtroFechaTipo === 'especifica' && (
            <input
              type="date"
              value={fechaEspecifica}
              onChange={(e) => setFechaEspecifica(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none"
            />
          )}

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="Pendiente_sena">Pendiente Seña</option>
            <option value="confirmado">Confirmado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <button
            onClick={onNuevoTurno}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            + Nuevo Turno
          </button>
        </div>
      </div>

      <ResumenAgenda turnos={turnosAgendaResumen} esFechaPasada={esFechaAgendaPasada} />

      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando turnos...</div>
      ) : turnosFiltrados.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No se encontraron reservas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Detalle / Zonas</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {turnosFiltrados.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {t.codigo_unico || '-'}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div>{t.cliente_nombre || 'Sin nombre'}</div>
                    {t.cliente_celular && (
                      <div className="text-xs text-gray-500">{t.cliente_celular}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700">
                    {renderFechaHora(t.fecha_hora_inicio)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {renderDetalle(t)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          t.estado === 'confirmado'
                            ? 'bg-blue-100 text-blue-700'
                            : t.estado === 'completado'
                            ? 'bg-green-100 text-green-700'
                            : t.estado === 'cancelado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {t.estado || 'pendiente'}
                      </span>

                      {t.estado === 'completado' && t.medio_pago && (
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded capitalize">
                          💳 {t.medio_pago}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onEditarTurno(t)}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 font-medium"
                    >
                      Editar
                    </button>
                    {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                      <button
                        onClick={() => onActualizarEstado(t.id, 'confirmado')}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        Confirmar
                      </button>
                    )}
                    {t.estado !== 'completado' && (
                      <button
                        onClick={() => onActualizarEstado(t.id, 'completado')}
                        className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                      >
                        Completar
                      </button>
                    )}
                    {t.estado !== 'cancelado' && (
                      <button
                        onClick={() => onActualizarEstado(t.id, 'cancelado')}
                        className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}