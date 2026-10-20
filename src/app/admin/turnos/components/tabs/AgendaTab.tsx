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
  Heart, 
  MessageCircle, 
  SlidersHorizontal,
  SquarePen,
  Lock,
  Check,
  X,
  HandCoins,
  Zap,
  Filter
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
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100 overflow-hidden transition-all dark:bg-zinc-900 dark:border-zinc-800">
      {/* Barra de filtros */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between dark:border-zinc-800">
        <div className="relative w-full lg:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente, tel o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-3 sm:py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all bg-gray-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

<div className="flex flex-wrap items-center gap-2 sm:gap-3">
  {/* Selector de Fechas */}
  <div className="relative flex items-center">
    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
    <select
      value={filtroFechaTipo}
      onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
      className="appearance-none border border-slate-200/80 rounded-xl pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
    >
      <option value="todos">Todas las fechas</option>
      <option value="hoy">Ver solo Hoy</option>
      <option value="especifica">Elegir fecha...</option>
    </select>
  </div>

  {filtroFechaTipo === 'especifica' && (
    <input
      type="date"
      value={fechaEspecifica}
      onChange={(e) => setFechaEspecifica(e.target.value)}
      className="border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all bg-white text-slate-700 shadow-2xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
    />
  )}

  {/* Selector de Estados */}
  <div className="relative flex items-center">
    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
    <select
      value={filtroEstado}
      onChange={(e) => setFiltroEstado(e.target.value)}
      className="appearance-none border border-slate-200/80 rounded-xl pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
    >
      <option value="todos">Todos los estados</option>
      <option value="pendiente_sena">Pendiente Seña</option>
      <option value="confirmado">Confirmado</option>
      <option value="completado">Completado</option>
      <option value="cancelado">Cancelado</option>
    </select>
  </div>

  {/* Selector de Medio de Pago */}
  <div className="relative flex items-center">
    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
    <select
      value={filtroMedioPago}
      onChange={(e) => setFiltroMedioPago(e.target.value)}
      className="appearance-none border border-slate-200/80 rounded-xl pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
    >
      <option value="todos">Todos los medios de pago</option>
      <option value="mercadopago">Mercado Pago</option>
      <option value="efectivo">Efectivo</option>
      <option value="whatsapp">WhatsApp</option>
    </select>
  </div>

  {/* Botón Bloquear Slots / VIP (Estilo refinado y minimalista) */}
  <button
    type="button"
    onClick={() => setModalBloqueosAbierto(true)}
    className="px-3.5 py-2.5 text-xs sm:text-sm bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 border border-amber-300/60 rounded-xl font-semibold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 select-none cursor-pointer dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
  >
    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />

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
          <div className="flex flex-col gap-3.5">
            {turnosFinales.map((t) => {
              const { iniciales, colorClass } = getAvatarInfo(t.cliente_nombre)
              const detalleTexto = renderDetalle(t)
              const numCelularLimpio = t.cliente_celular ? t.cliente_celular.replace(/\D/g, '') : ''

              const detalle = typeof t.detalle_reserva === 'string' 
                ? JSON.parse(t.detalle_reserva || '{}') 
                : t.detalle_reserva || {}
              
              const fueModificado = (t as any).modificado_por_admin || detalle.hubo_cambios || (detalle.swaps && Object.keys(detalle.swaps).length > 0)
              const esGeneral = t.servicio_tipo === 'general'

              const fechaObj = t.fecha_hora_inicio ? new Date(t.fecha_hora_inicio) : null
              const mesStr = fechaObj ? fechaObj.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase() : 'FECHA'
              const diaStr = fechaObj ? fechaObj.getDate() : '--'

              return (
                <div
                  key={t.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    esGeneral 
                      ? 'border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/20 to-transparent dark:from-purple-950/10' 
                      : 'border-slate-200/80 dark:border-zinc-800'
                  }`}
                >
                  {/* IZQUIERDA: Bloque de Fecha Tipo Calendario + Información del Turno */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    
                    {/* Tarjeta Visual de Fecha (Mes + Día) */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/60 dark:border-zinc-700/50 flex flex-col items-center justify-center shrink-0 shadow-2xs select-none">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase leading-none">
                        {mesStr}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 leading-none mt-1">
                        {diaStr}
                      </span>
                    </div>

                    {/* Información y Jerarquía Tipográfica */}
                    <div className="flex flex-col min-w-0 gap-1 flex-1">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          #{t.codigo_unico || '-'}
                        </span>

                        {/* Distintivo de Tipo de Servicio (Sin fondo, texto sutil) */}
<span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
  {esGeneral ? <Heart className="w-3 h-3 text-slate-400" /> : <Zap className="w-3 h-3 text-amber-500" />}
  <span>{esGeneral ? 'General' : 'Láser'}</span>
</span>

{fueModificado && (
  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
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

                      <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200 capitalize tracking-normal truncate">
                     {detalleTexto || 'Turno agendado'}
                      </h3>

                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {renderFechaHora(t.fecha_hora_inicio)}
                        </span>
                        
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {t.cliente_nombre || 'Sin nombre'}
                        </span>

                        {t.cliente_celular && (
                          <>
                            <span className="text-slate-300 dark:text-zinc-600">•</span>
                            <span className="flex items-center gap-1 font-mono text-slate-500">
                              <MessageCircle className="w-3 h-3 text-slate-400" />
                              {t.cliente_celular}
                            </span>
                          </>
                        )}

                        <span className="text-slate-300 dark:text-zinc-600">•</span>

                        <span className="font-extrabold text-slate-900 dark:text-zinc-100">
                          ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DERECHA: Estado, Medio de Pago y Barra Minimalista de Iconos */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-slate-100 dark:border-zinc-800 md:border-t-0 shrink-0 flex-wrap">
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                          t.estado === 'confirmado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : t.estado === 'completado'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/80 dark:text-blue-300'
                            : t.estado === 'cancelado'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {t.estado || 'pendiente'}
                      </span>

                      {(t.medio_pago || t.tipo_pago_elegido) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md capitalize dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                          <CreditCard className="w-2.5 h-2.5" />
                          {t.medio_pago || t.tipo_pago_elegido}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/50">
                      {numCelularLimpio && (
                        <a
                          href={`https://wa.me/${numCelularLimpio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 rounded-lg transition-all"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => onEditarTurno(t)}
                        className="p-2 text-slate-600 hover:bg-slate-200/60 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-all"
                        title="Editar Turno"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>

                      {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'confirmado')}
                          className="p-2 text-blue-600 hover:bg-blue-100/60 dark:hover:bg-blue-950/50 rounded-lg transition-all"
                          title="Confirmar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {t.estado !== 'completado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'completado')}
                          className="p-2 text-emerald-600 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 rounded-lg transition-all"
                          title="Completar"
                        >
                          <HandCoins className="w-4 h-4" />
                        </button>
                      )}

                      {t.estado !== 'cancelado' && (
                        <button
                          onClick={() => onActualizarEstado(t.id, 'cancelado')}
                          className="p-2 text-orange-600 hover:bg-orange-100/60 dark:hover:bg-orange-950/50 rounded-lg transition-all"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleConfirmarEliminacion(t.id, t.cliente_nombre || '')}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all"
                        title="Eliminar reserva"
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
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
        />
      )}
    </div>
  )
}