// src/app/admin/turnos/components/tabs/AgendaTab.tsx
'use client'

import { useState } from 'react'
import { Search, CalendarDays, Plus, Gift, CreditCard, Trash2 } from 'lucide-react'
import ResumenAgenda from '@/app/admin/turnos/components/ResumenAgenda'
import { Reserva, renderDetalle, renderFechaHora } from '@/app/admin/turnos/components/types'

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
  onEliminarTurno: (id: string) => Promise<void> | void
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
  onActualizarEstado,
  onEliminarTurno
}: AgendaTabProps) {
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>('todos')

  const turnosFinales = turnosFiltrados.filter((t) => {
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      const matchNombre = (t.cliente_nombre || '').toLowerCase().includes(q)
      const matchTel = (t.cliente_celular || '').toLowerCase().includes(q)
      const matchCodigo = (t.codigo_unico || '').toLowerCase().includes(q)
      if (!matchNombre && !matchTel && !matchCodigo) return false
    }

    if (filtroEstado !== 'todos') {
      const estadoActual = String(t.estado || '').toLowerCase().trim()
      const estadoBuscado = filtroEstado.toLowerCase().trim()

      if (estadoBuscado === 'pendiente_sena') {
        const esPendienteSena =
          estadoActual.includes('sena') ||
          estadoActual.includes('seña') ||
          estadoActual === 'pendiente' ||
          estadoActual === 'pendiente_sena'
        if (!esPendienteSena) return false
      } else {
        if (estadoActual !== estadoBuscado) return false
      }
    }

    if (filtroMedioPago !== 'todos') {
      const medioRaw = String(t.medio_pago || t.tipo_pago_elegido || '').toLowerCase().trim()

      if (filtroMedioPago === 'mercadopago') {
        const esMP =
          medioRaw.includes('mercadopago') ||
          medioRaw.includes('mercado_pago') ||
          medioRaw.includes('mercado pago') ||
          medioRaw.includes('mp') ||
          medioRaw.includes('transferencia')
        if (!esMP) return false
      } else if (filtroMedioPago === 'efectivo') {
        if (!medioRaw.includes('efectivo') && !medioRaw.includes('cash')) return false
      } else if (filtroMedioPago === 'whatsapp') {
        if (!medioRaw.includes('whatsapp') && !medioRaw.includes('wa')) return false
      }
    }

    return true
  })

  const handleConfirmarEliminacion = async (id: string, cliente: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la reserva de ${cliente || 'este cliente'}?`)
    if (confirmar) {
      await onEliminarTurno(id)
    }
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all dark:bg-zinc-900 dark:border-zinc-800">
      {/* Barra de filtros */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between dark:border-zinc-800">
        <div className="relative w-full lg:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente, tel o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={filtroFechaTipo}
            onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
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
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            />
          )}

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente_sena">⏳ Pendiente Seña</option>
            <option value="confirmado">✅ Confirmado</option>
            <option value="completado">🎉 Completado</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>

          <select
            value={filtroMedioPago}
            onChange={(e) => setFiltroMedioPago(e.target.value)}
            className="border border-blue-200 bg-blue-50/50 text-blue-900 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300"
          >
            <option value="todos">Todos los medios de pago</option>
            <option value="mercadopago">💳 Mercado Pago</option>
            <option value="efectivo">💵 Efectivo</option>
            <option value="whatsapp">💬 WhatsApp</option>
          </select>

          <button
            onClick={onNuevoTurno}
            className="px-4 py-2.5 text-xs sm:text-sm bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4" />
            Nuevo Turno
          </button>
        </div>
      </div>

      <ResumenAgenda turnos={turnosAgendaResumen} esFechaPasada={esFechaAgendaPasada} />

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs font-medium animate-pulse dark:text-zinc-500">
          Cargando turnos...
        </div>
      ) : turnosFinales.length === 0 ? (
        <div className="p-12 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2 dark:text-zinc-700" />
          <p className="text-gray-400 text-sm font-medium dark:text-zinc-400">No se encontraron reservas con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* Indicador de scroll horizontal, visible solo en mobile */}
          <p className="sm:hidden text-[11px] text-gray-400 dark:text-zinc-500 font-medium mb-2 flex items-center gap-1">
            ↔ Deslizá la tabla hacia los costados para ver más columnas
          </p>

          {/* Contenedor con altura delimitada y scroll en ambas direcciones */}
          <div className="w-full max-h-[70vh] overflow-auto scroll-smooth border border-gray-100 rounded-2xl relative dark:border-zinc-800">
            <table className="w-full min-w-[950px] text-left text-sm border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-md dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-500">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-xl">Código</th>
                  <th className="px-4 py-3.5">Cliente</th>
                  <th className="px-4 py-3.5">Fecha y Hora</th>
                  <th className="px-4 py-3.5">Detalle / Zonas</th>
                  <th className="px-4 py-3.5">Monto</th>
                  <th className="px-4 py-3.5">Estado / Medio Pago</th>
                  <th className="px-4 py-3.5 text-right rounded-r-xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {turnosFinales.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-4 font-mono text-xs text-gray-400 whitespace-nowrap dark:text-zinc-500">
                      {t.codigo_unico || '-'}
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-zinc-100">{t.cliente_nombre || 'Sin nombre'}</span>

                        {(t as any).codigo_referido_propio && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300" title="Código de referido propio del cliente">
                            {(t as any).codigo_referido_propio}
                          </span>
                        )}

                        {t.codigo_referido_usado && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-semibold dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300" title="Descuento aplicado con código">
                            <Gift className="w-3 h-3" />
                            {t.codigo_referido_usado}
                          </span>
                        )}
                      </div>
                      {t.cliente_celular && (
                        <div className="text-xs text-gray-400 mt-0.5 dark:text-zinc-400">{t.cliente_celular}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap dark:text-zinc-400">
                      {renderFechaHora(t.fecha_hora_inicio)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 font-medium dark:bg-zinc-800 dark:text-zinc-300">
                        {renderDetalle(t)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-extrabold text-gray-900 whitespace-nowrap dark:text-zinc-100">
                      ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            t.estado === 'confirmado'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                              : t.estado === 'completado'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : t.estado === 'cancelado'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/80 dark:text-yellow-300'
                          }`}
                        >
                          {t.estado || 'pendiente'}
                        </span>

                        {(t.medio_pago || t.tipo_pago_elegido) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md capitalize dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
                            <CreditCard className="w-3 h-3" />
                            {t.medio_pago || t.tipo_pago_elegido}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEditarTurno(t)}
                          className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 font-bold transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Editar
                        </button>
                        {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'confirmado')}
                            className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-all active:scale-95 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60"
                          >
                            Confirmar
                          </button>
                        )}
                        {t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'completado')}
                            className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 font-bold transition-all active:scale-95 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                          >
                            Completar
                          </button>
                        )}
                        {t.estado !== 'cancelado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'cancelado')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 font-bold transition-all active:scale-95 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-900/60"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => handleConfirmarEliminacion(t.id, t.cliente_nombre || '')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 ml-1 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-950/60"
                          title="Eliminar reserva permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}