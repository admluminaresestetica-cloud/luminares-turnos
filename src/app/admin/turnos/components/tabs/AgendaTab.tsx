// src/app/admin/turnos/components/tabs/AgendaTab.tsx
'use client'

import { useState } from 'react'
import { 
  Search, 
  CalendarDays, 
  Plus, 
  Gift, 
  CreditCard, 
  Trash2, 
  Calendar, 
  Scissors, 
  Phone, 
  MessageCircle,
  SlidersHorizontal,
  Edit3
  Lock 
} from 'lucide-react'
import ResumenAgenda from '@/app/admin/turnos/components/ResumenAgenda'
import { Reserva, renderDetalle, renderFechaHora } from '@/app/admin/turnos/components/types'

import ModalBloqueoHorarios from '@/app/admin/turnos/components/modals/ModalBloqueoHorarios'

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

// Helper para generar iniciales y color de avatar tipo "PR"
function getAvatarInfo(nombre?: string) {
  const limpio = (nombre || 'Cliente').trim()
  const partes = limpio.split(' ')
  const iniciales = partes.length > 1 
    ? `${partes[0][0]}${partes[1][0]}`.toUpperCase() 
    : limpio.slice(0, 2).toUpperCase()

  const colores = [
    'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
  ]
  const index = limpio.charCodeAt(0) % colores.length
  return { iniciales, colorClass: colores[index] }
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

  const [modalBloqueosAbierto, setModalBloqueosAbierto] = useState<boolean>(false)


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
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={filtroFechaTipo}
            onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
            className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
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
              className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            />
          )}

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
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
            className="border border-blue-200 bg-blue-50/50 text-blue-900 rounded-xl px-3 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300"
          >
            <option value="todos">Todos los medios de pago</option>
            <option value="mercadopago">💳 Mercado Pago</option>
            <option value="efectivo">💵 Efectivo</option>
            <option value="whatsapp">💬 WhatsApp</option>
          </select>

                  <button
            type="button"
            onClick={() => setModalBloqueosAbierto(true)}
            className="min-h-[44px] px-4 py-3 sm:py-2.5 text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 select-none cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Bloquear Slots / VIP
          </button>

          <button
            onClick={onNuevoTurno}
            className="min-h-[44px] px-4 py-3 sm:py-2.5 text-xs sm:text-sm bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 select-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
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
          <p className="text-gray-400 text-sm font-medium dark:text-zinc-400">
            No se encontraron reservas con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* LISTA DE TARJETAS FLOTANTES MODERNAS */}
          <div className="flex flex-col gap-3.5">
            {turnosFinales.map((t) => {
              const { iniciales, colorClass } = getAvatarInfo(t.cliente_nombre)
              const detalleTexto = renderDetalle(t)
              const numCelularLimpio = t.cliente_celular ? t.cliente_celular.replace(/\D/g, '') : ''

              const detalle = typeof t.detalle_reserva === 'string' 
                ? JSON.parse(t.detalle_reserva || '{}') 
                : t.detalle_reserva || {}
              
              const fueModificado = (t as any).modificado_por_admin || detalle.hubo_cambios || (detalle.swaps && Object.keys(detalle.swaps).length > 0)

              return (
                <div
                  key={t.id}
                  className="bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* IZQUIERDA: Avatar con iniciales, Nombre, Celular, Fecha y Zonas */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${colorClass}`}>
                      {iniciales}
                    </div>

                    <div className="flex flex-col min-w-0 gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md dark:bg-zinc-700 dark:text-zinc-400">
                          #{t.codigo_unico || '-'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                          {t.cliente_nombre || 'Sin nombre'}
                        </h4>

                        {fueModificado && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-semibold dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300">
                            <SlidersHorizontal className="w-2.5 h-2.5" />
                            <span>Modificado</span>
                          </span>
                        )}

                        {t.codigo_referido_usado && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-semibold dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300">
                            <Gift className="w-2.5 h-2.5" />
                            {t.codigo_referido_usado}
                          </span>
                        )}
                      </div>

                      {/* Teléfono y Fecha */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 flex-wrap">
                        {t.cliente_celular && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {t.cliente_celular}
                          </span>
                        )}
                        <span className="text-gray-300 dark:text-zinc-600">•</span>
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          {renderFechaHora(t.fecha_hora_inicio)}
                        </span>
                      </div>

                      {/* Detalle y Monto */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg font-medium max-w-md truncate" title={detalleTexto}>
                          <Scissors className="w-3 h-3 text-rose-500 shrink-0" />
                          {detalleTexto}
                        </span>
                        <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 ml-1">
                          Monto: ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DERECHA: Estado, Medio de pago y Botones (Editar, Confirmar, Completar, Cancelar, Eliminar) */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-gray-100 dark:border-zinc-700/50 md:border-t-0 shrink-0 flex-wrap">
                    <div className="flex flex-col items-start md:items-end gap-1">
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md capitalize dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
                          <CreditCard className="w-2.5 h-2.5" />
                          {t.medio_pago || t.tipo_pago_elegido}
                        </span>
                      )}
                    </div>

                    {/* Botones de acción completos */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {numCelularLimpio && (
                        <a
                          href={`https://wa.me/${numCelularLimpio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center gap-1 dark:bg-emerald-950/60 dark:text-emerald-300"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}

                      <button
                        onClick={() => onEditarTurno(t)}
                        className="text-xs bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 dark:bg-zinc-700 dark:text-zinc-200"
                      >
                        Editar
                      </button>

                      {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'confirmado')}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95 dark:bg-blue-950/60 dark:text-blue-400"
                        >
                          Confirmar
                        </button>
                      )}

                      {t.estado !== 'completado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'completado')}
                          className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-100 transition-all active:scale-95 dark:bg-emerald-950/60 dark:text-emerald-400"
                        >
                          Completar
                        </button>
                      )}

                      {t.estado !== 'cancelado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'cancelado')}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95 dark:bg-red-950/60 dark:text-red-400"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => handleConfirmarEliminacion(t.id, t.cliente_nombre || '')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-950/60"
                        title="Eliminar reserva permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}


      {modalBloqueosAbierto && (
        <ModalBloqueoHorarios
          onClose={() => setModalBloqueosAbierto(false)}
          onExito={() => {
            // Recargar datos si es necesario
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
        />
      )}

    </div>
  )
}