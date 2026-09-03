// src/app/admin/turnos/components/tabs/AgendaTab.tsx
'use client'

import { useState } from 'react'
import { Search, CalendarDays, Plus, Gift, CreditCard, Trash2 } from 'lucide-react'
import ResumenAgenda from '@/app/admin/turnos/components/ResumenAgenda'
import { Reserva, renderDetalle, renderFechaHora } from '@/app/admin/turnos/components/types';

interface AgendaTabProps {
  loading: boolean
  turnosFiltrados: Reserva[] // Se reciben todos los turnos base
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
  onEliminarTurno: (id: string) => void // 🔴 Nueva prop para manejar la eliminación
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
  // Estado local para el Medio de Pago
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>('todos')

  // FILTRADO UNIFICADO Y SEGURO DE TODAS LAS CONDICIONES
  const turnosFinales = turnosFiltrados.filter((t) => {
    // 1. Filtro por Búsqueda de Texto (Cliente, Teléfono, Código)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      const matchNombre = (t.cliente_nombre || '').toLowerCase().includes(q)
      const matchTel = (t.cliente_celular || '').toLowerCase().includes(q)
      const matchCodigo = (t.codigo_unico || '').toLowerCase().includes(q)
      if (!matchNombre && !matchTel && !matchCodigo) return false
    }

    // 2. Filtro por Estado (Tolerante a variantes de 'pendiente_sena')
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

    // 3. Filtro por Medio de Pago (Tolerante a variantes de Mercado Pago, Wa, Cash)
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

  // Manejador local con confirmación antes de llamar a la prop del padre
  const handleConfirmarEliminacion = (id: string, cliente: string) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la reserva de ${cliente || 'este cliente'}?`)
    if (confirmar) {
      onEliminarTurno(id)
    }
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all">
      {/* Barra de filtros */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente, tel o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filtro Fecha */}
          <select
            value={filtroFechaTipo}
            onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50"
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
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50"
            />
          )}

          {/* Filtro Estado del Turno */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente_sena">⏳ Pendiente Seña</option>
            <option value="confirmado">✅ Confirmado</option>
            <option value="completado">🎉 Completado</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>

          {/* Filtro Medio de Pago */}
          <select
            value={filtroMedioPago}
            onChange={(e) => setFiltroMedioPago(e.target.value)}
            className="border border-blue-200 bg-blue-50/50 text-blue-900 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="todos">Todos los medios de pago</option>
            <option value="mercadopago">💳 Mercado Pago</option>
            <option value="efectivo">💵 Efectivo</option>
            <option value="whatsapp">💬 WhatsApp</option>
          </select>

          <button
            onClick={onNuevoTurno}
            className="px-4 py-2.5 text-xs sm:text-sm bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo Turno
          </button>
        </div>
      </div>

      <ResumenAgenda turnos={turnosAgendaResumen} esFechaPasada={esFechaAgendaPasada} />

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs font-medium animate-pulse">
          Cargando turnos...
        </div>
      ) : turnosFinales.length === 0 ? (
        <div className="p-12 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">No se encontraron reservas con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5 rounded-l-xl">Código</th>
                  <th className="px-4 sm:px-6 py-3.5">Cliente</th>
                  <th className="px-4 sm:px-6 py-3.5">Fecha y Hora</th>
                  <th className="px-4 sm:px-6 py-3.5">Detalle / Zonas</th>
                  <th className="px-4 sm:px-6 py-3.5">Monto</th>
                  <th className="px-4 sm:px-6 py-3.5">Estado / Medio Pago</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right rounded-r-xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {turnosFinales.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {t.codigo_unico || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{t.cliente_nombre || 'Sin nombre'}</span>
                        {t.codigo_referido_usado && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            <Gift className="w-3 h-3" />
                            {t.codigo_referido_usado}
                          </span>
                        )}
                      </div>
                      {t.cliente_celular && (
                        <div className="text-xs text-gray-400 mt-0.5">{t.cliente_celular}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                      {renderFechaHora(t.fecha_hora_inicio)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                        {renderDetalle(t)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-extrabold text-gray-900 whitespace-nowrap">
                      ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            t.estado === 'confirmado'
                              ? 'bg-blue-100 text-blue-700'
                              : t.estado === 'completado'
                              ? 'bg-emerald-100 text-emerald-700'
                              : t.estado === 'cancelado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {t.estado || 'pendiente'}
                        </span>

                        {(t.medio_pago || t.tipo_pago_elegido) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md capitalize">
                            <CreditCard className="w-3 h-3" />
                            {t.medio_pago || t.tipo_pago_elegido}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEditarTurno(t)}
                          className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 font-bold transition-all"
                        >
                          Editar
                        </button>
                        {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'confirmado')}
                            className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-all"
                          >
                            Confirmar
                          </button>
                        )}
                        {t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'completado')}
                            className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 font-bold transition-all"
                          >
                            Completar
                          </button>
                        )}
                        {t.estado !== 'cancelado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'cancelado')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        )}

                        {/* Botón Ícono de Borrar/Eliminar Reserva sin envoltorio opcional */}
                        <button
                          onClick={() => handleConfirmarEliminacion(t.id, t.cliente_nombre || '')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-1"
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