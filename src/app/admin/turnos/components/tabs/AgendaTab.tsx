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
  ChevronDown, 
  Calendar, 
  Scissors, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageCircle 
} from 'lucide-react'
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

// Componente para renderizar la tarjeta expandible en Mobile
function TarjetaTurnoMobile({
  t,
  onEditarTurno,
  onActualizarEstado,
  handleConfirmarEliminacion
}: {
  t: Reserva
  onEditarTurno: (t: Reserva) => void
  onActualizarEstado: (id: string, nuevoEstado: string) => void
  handleConfirmarEliminacion: (id: string, cliente: string) => void
}) {
  const [expandido, setExpandido] = useState(false)

  const numCelularLimpio = t.cliente_celular ? t.cliente_celular.replace(/\D/g, '') : ''

  return (
    <div
      onClick={() => setExpandido(!expandido)}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer select-none dark:bg-zinc-800/80 dark:border-zinc-700/60"
    >
      {/* CABECERA RESUMIDA (Visible siempre) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md dark:bg-zinc-700 dark:text-zinc-400">
              #{t.codigo_unico || '-'}
            </span>
            <h4 className="text-sm font-bold text-gray-900 truncate dark:text-zinc-100">
              {t.cliente_nombre || 'Sin nombre'}
            </h4>

            {(t as any).codigo_referido_propio && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
                {(t as any).codigo_referido_propio}
              </span>
            )}

            {t.codigo_referido_usado && (
              <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full text-[10px] font-semibold dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300">
                <Gift className="w-2.5 h-2.5" />
                {t.codigo_referido_usado}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base font-extrabold text-gray-900 dark:text-zinc-100">
            ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 dark:text-zinc-500 ${
              expandido ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* ESTADO Y MEDIO DE PAGO (Visible siempre) */}
      <div className="flex items-center gap-2 mt-2.5">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
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

      {/* DETALLE EXPANDIBLE (Visible solo al hacer tap) */}
      {expandido && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 text-xs text-gray-600 dark:border-zinc-700/80 dark:text-zinc-300 animate-in fade-in duration-200">
          {/* Fecha y Hora */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              {renderFechaHora(t.fecha_hora_inicio)}
            </span>
          </div>

          {/* Detalle / Zonas */}
          <div className="flex items-start gap-2">
            <Scissors className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
            <p className="m-0 bg-gray-50 p-2 rounded-xl text-xs text-gray-700 font-medium leading-relaxed w-full border border-gray-100 dark:bg-zinc-900 dark:border-zinc-700/50 dark:text-zinc-300">
              {renderDetalle(t)}
            </p>
          </div>

          {/* Teléfono / WhatsApp */}
          {t.cliente_celular && (
            <div className="flex items-center justify-between bg-emerald-50/60 p-2 rounded-xl border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-semibold">{t.cliente_celular}</span>
              </div>
              {numCelularLimpio && (
                <a
                  href={`https://wa.me/${numCelularLimpio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Botones de Acción Móviles */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 justify-end border-t border-gray-100 dark:border-zinc-700/50">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditarTurno(t)
              }}
              className="text-xs bg-gray-100 text-gray-800 px-3 py-2 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 select-none dark:bg-zinc-700 dark:text-zinc-200"
            >
              Editar
            </button>

            {t.estado !== 'confirmado' && t.estado !== 'completado' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onActualizarEstado(t.id, 'confirmado')
                }}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95 select-none dark:bg-blue-950/60 dark:text-blue-400"
              >
                Confirmar
              </button>
            )}

            {t.estado !== 'completado' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onActualizarEstado(t.id, 'completado')
                }}
                className="text-xs bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-all active:scale-95 select-none dark:bg-emerald-950/60 dark:text-emerald-400"
              >
                Completar
              </button>
            )}

            {t.estado !== 'cancelado' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onActualizarEstado(t.id, 'cancelado')
                }}
                className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95 select-none dark:bg-red-950/60 dark:text-red-400"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleConfirmarEliminacion(t.id, t.cliente_nombre || '')
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 select-none dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-950/60"
              title="Eliminar reserva permanentemente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
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
            onClick={onNuevoTurno}
            className="min-h-[44px] px-4 py-3 sm:py-2.5 text-xs sm:text-sm bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1.5 active:scale-95 select-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
          {/* VISTA MÓVIL (TARJETAS EXPANDIBLES < lg) */}
          <div className="flex flex-col gap-3 lg:hidden">
            {turnosFinales.map((t) => (
              <TarjetaTurnoMobile
                key={t.id}
                t={t}
                onEditarTurno={onEditarTurno}
                onActualizarEstado={onActualizarEstado}
                handleConfirmarEliminacion={handleConfirmarEliminacion}
              />
            ))}
          </div>

          {/* VISTA ESCRITORIO / PC (TABLA COMPLETA >= lg) */}
          <div className="hidden lg:block w-full max-h-[70vh] overflow-auto scroll-smooth rounded-2xl border border-gray-100 dark:border-zinc-800 relative">
            <table className="w-full min-w-[1050px] text-left text-sm border-collapse">
              <thead className="bg-gray-50/90 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-md dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-500">
                <tr>
                  <th className="px-4 py-3.5 rounded-l-xl w-24">Código</th>
                  <th className="px-4 py-3.5 min-w-[200px]">Cliente</th>
                  <th className="px-4 py-3.5 min-w-[180px]">Fecha y Hora</th>
                  <th className="px-4 py-3.5 min-w-[220px]">Detalle / Zonas</th>
                  <th className="px-4 py-3.5 w-28">Monto</th>
                  <th className="px-4 py-3.5 min-w-[160px]">Estado / Medio Pago</th>
                  <th className="px-4 py-3.5 text-right rounded-r-xl min-w-[220px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {turnosFinales.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-4 font-mono text-xs text-gray-400 whitespace-nowrap dark:text-zinc-500">
                      #{t.codigo_unico || '-'}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-900 dark:text-zinc-100 font-bold">{t.cliente_nombre || 'Sin nombre'}</span>

                        {(t as any).codigo_referido_propio && (
                          <span
                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                            title="Código de referido propio del cliente"
                          >
                            {(t as any).codigo_referido_propio}
                          </span>
                        )}

                        {t.codigo_referido_usado && (
                          <span
                            className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-semibold dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300"
                            title="Descuento aplicado con código"
                          >
                            <Gift className="w-3 h-3" />
                            {t.codigo_referido_usado}
                          </span>
                        )}
                      </div>
                      {t.cliente_celular && (
                        <div className="text-xs text-gray-400 mt-0.5 dark:text-zinc-400 font-normal">
                          {t.cliente_celular}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap dark:text-zinc-400">
                      {renderFechaHora(t.fecha_hora_inicio)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 font-medium inline-block max-w-[280px] truncate dark:bg-zinc-800 dark:text-zinc-300">
                        {renderDetalle(t)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-extrabold text-gray-900 whitespace-nowrap dark:text-zinc-100">
                      ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                      <div className="inline-flex items-center justify-end gap-1.5 w-full">
                        <button
                          onClick={() => onEditarTurno(t)}
                          className="text-xs bg-gray-100 text-gray-700 px-2.5 py-2 rounded-lg hover:bg-gray-200 font-bold transition-all active:scale-95 select-none dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Editar
                        </button>
                        {t.estado !== 'confirmado' && t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'confirmado')}
                            className="text-xs bg-blue-50 text-blue-600 px-2.5 py-2 rounded-lg hover:bg-blue-100 font-bold transition-all active:scale-95 select-none dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60"
                          >
                            Confirmar
                          </button>
                        )}
                        {t.estado !== 'completado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'completado')}
                            className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-2 rounded-lg hover:bg-emerald-100 font-bold transition-all active:scale-95 select-none dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                          >
                            Completar
                          </button>
                        )}
                        {t.estado !== 'cancelado' && (
                          <button
                            onClick={() => onActualizarEstado(t.id, 'cancelado')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-2 rounded-lg hover:bg-red-100 font-bold transition-all active:scale-95 select-none dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-900/60"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => handleConfirmarEliminacion(t.id, t.cliente_nombre || '')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 select-none dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-950/60"
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