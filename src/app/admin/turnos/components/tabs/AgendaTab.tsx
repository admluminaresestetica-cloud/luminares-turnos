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
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(
  new Date().toISOString().split('T')[0]
)
  const [mesActualIndex, setMesActualIndex] = useState<number>(0) // 0 = mes actual, +1 = mes siguiente, -1 = mes anterior, etc.

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

  // Calculamos los días del mes según el desplazamiento de meses
  const fechaBaseMes = new Date()
  fechaBaseMes.setMonth(fechaBaseMes.getMonth() + mesActualIndex)
  const anioActual = fechaBaseMes.getFullYear()
  const mesIndex = fechaBaseMes.getMonth()

  // Nombre del mes y año actual para mostrar en el selector final
  const nombreMesAnio = fechaBaseMes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const nombreMesAnioCapitalizado = nombreMesAnio.charAt(0).toUpperCase() + nombreMesAnio.slice(1)

  // Array con todos los días del mes correspondiente
  const diasDelMes = Array.from({ 
    length: new Date(anioActual, mesIndex + 1, 0).getDate() 
  }).map((_, i) => {
    const d = new Date(anioActual, mesIndex, i + 1)
    const iso = d.toISOString().split('T')[0]
    const diaNum = d.getDate()
    const diaNombre = d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase()
    return { iso, diaNum, diaNombre }
  })

return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100 overflow-hidden transition-all dark:bg-zinc-900 dark:border-zinc-800 p-3 sm:p-5 flex flex-col gap-4">
      
      {/* 1. RESUMEN DE RECAUDACIÓN MOVIDO ARRIBA DE TODO */}
      <ResumenAgenda turnos={turnosAgendaResumen} esFechaPasada={esFechaAgendaPasada} />

      {/* 2. BARRA DE FILTROS COMPACTA + TIRA DE DÍAS MENSUAL */}
      <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 bg-slate-50/40 dark:bg-zinc-900/60 flex flex-col gap-3">
        
        {/* Lanza Superior: Buscador + Filtros de Iconos Compactos */}
        <div className="flex items-center gap-2">
          {/* Buscador de Texto */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cliente, numero o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500/35 transition-all bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 shadow-2xs"
            />
          </div>

          {/* Filtro Compacto de Estado (Solo Icono) */}
          <div className="relative flex items-center p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 shrink-0 cursor-pointer transition-colors shadow-2xs">
            <Filter className={`w-4 h-4 ${filtroEstado !== 'todos' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-zinc-400'}`} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Filtrar por Estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente_sena">Pendiente Seña</option>
              <option value="confirmado">Confirmado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Filtro Compacto de Medio de Pago (Solo Icono) */}
          <div className="relative flex items-center p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 shrink-0 cursor-pointer transition-colors shadow-2xs">
            <CreditCard className={`w-4 h-4 ${filtroMedioPago !== 'todos' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-zinc-400'}`} />
            <select
              value={filtroMedioPago}
              onChange={(e) => setFiltroMedioPago(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Filtrar por Medio de Pago"
            >
              <option value="todos">Todos los medios de pago</option>
              <option value="mercadopago">Mercado Pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Calendario de Selección Fecha Puntual (Solo Icono) */}
          <div className="relative flex items-center p-2.5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 shrink-0 cursor-pointer transition-colors shadow-2xs">
            <Calendar className={`w-4 h-4 ${filtroFechaTipo === 'especifica' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-zinc-400'}`} />
            <input
              type="date"
              value={fechaEspecifica}
              onChange={(e) => {
                setFechaEspecifica(e.target.value)
                setFiltroFechaTipo('especifica')
                setDiaSeleccionado(e.target.value)
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Elegir fecha especifica"
            />
          </div>

          {/* Botón Bloquear Horarios */}
          <button
            type="button"
            onClick={() => setModalBloqueosAbierto(true)}
            className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300/60 rounded-xl shrink-0 transition-colors dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 cursor-pointer shadow-2xs"
            title="Bloquear Horarios"
          >
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>

        {/* TIRA DE DÍAS MENSUAL DESLIZABLE + NAVEGADOR DE MESES */}
        <div className="flex flex-col gap-2 pt-2 pb-1 border-t border-slate-200/60 dark:border-zinc-800">
          
          {/* Encabezado de la barra: Mes actual y controles para cambiar de mes/año */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
               {nombreMesAnioCapitalizado}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMesActualIndex((prev) => prev - 1)}
                className="px-2 py-1 text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer shadow-2xs"
                title="Mes anterior"
              >
                ← Mes anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  setMesActualIndex(0)
                  const hoyIso = new Date().toISOString().split('T')[0]
                  setDiaSeleccionado(hoyIso)
                  setFechaEspecifica(hoyIso)
                  setFiltroFechaTipo('especifica')
                }}
                className="px-2 py-1 text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer shadow-2xs"
                title="Ir al mes y día actual"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setMesActualIndex((prev) => prev + 1)}
                className="px-2 py-1 text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer shadow-2xs"
                title="Mes siguiente"
              >
                Mes siguiente →
              </button>
            </div>
          </div>

          {/* Contenedor Scrollable Horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar select-none scroll-smooth">
            {diasDelMes.map((d) => {
              const esActivo = diaSeleccionado === d.iso
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    setDiaSeleccionado(d.iso)
                    setFechaEspecifica(d.iso)
                    setFiltroFechaTipo('especifica')
                  }}
                  className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[52px] py-2 px-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    esActivo
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 scale-105 font-bold'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-[9px] font-bold tracking-wider opacity-80 uppercase">
                    {d.diaNombre}
                  </span>
                  <span className="text-sm font-black mt-0.5">
                    {d.diaNum}
                  </span>
                  {esActivo && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* 3. LISTADO DE TURNOS O ESTADOS DE CARGA */}
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
        <div className="pt-2">
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

              const esCompletado = t.estado === 'completado'
              const esCancelado = t.estado === 'cancelado'

              return (
                <div
                  key={t.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    esCompletado
                      ? 'border-emerald-300/80 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : esCancelado
                      ? 'border-slate-200/60 bg-slate-50/50 opacity-75 dark:border-zinc-800 dark:bg-zinc-900/40'
                      : esGeneral 
                      ? 'border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/20 to-transparent dark:from-purple-950/10' 
                      : 'border-slate-200/80 dark:border-zinc-800'
                  }`}
                >

                  {/* IZQUIERDA: Bloque de Fecha Tipo Calendario + Información del Turno */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    
                    {/* Tarjeta Visual de Fecha con colores según estado */}
                    <div 
                      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-2xs select-none transition-colors ${
                        t.estado === 'completado'
                          ? 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-500'
                          : t.estado === 'cancelado'
                          ? 'bg-rose-500 border-rose-600 text-white dark:bg-rose-600 dark:border-rose-500'
                          : 'bg-slate-50 border-slate-200/60 dark:bg-zinc-800/80 dark:border-zinc-700/50'
                      }`}
                    >
                      <span 
                        className={`text-[10px] font-bold tracking-wider uppercase leading-none ${
                          t.estado === 'completado' || t.estado === 'cancelado' 
                            ? 'text-white/80' 
                            : 'text-slate-400 dark:text-zinc-400'
                        }`}
                      >
                        {mesStr}
                      </span>
                      <span 
                        className={`text-lg sm:text-xl font-black leading-none mt-1 ${
                          t.estado === 'completado' || t.estado === 'cancelado' 
                            ? 'text-white' 
                            : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {diaStr}
                      </span>
                    </div>

                    {/* Información y Jerarquía Tipográfica */}
                    <div className="flex flex-col min-w-0 gap-1 flex-1">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          #{t.codigo_unico || '-'}
                        </span>

                        {/* Distintivo de Tipo de Servicio */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
  {esGeneral ? (
    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
  ) : (
    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
  )}
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

                  {/* DERECHA: Estado, Medio de Pago y Botones */}
<div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t border-slate-100 dark:border-zinc-800 md:border-t-0 shrink-0">
  
  {/* Columna derecha centrada verticalmente */}
  <div className="flex flex-col items-start md:items-end justify-center gap-1.5">
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
        t.estado === 'confirmado'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/80 dark:text-emerald-300'
          : t.estado === 'completado'
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/80 dark:text-emerald-300'
          : t.estado === 'cancelado'
          ? 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/80 dark:text-rose-300'
          : t.estado === 'en_gabinete' || t.estado === 'espera'
          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse dark:bg-amber-950/90 dark:text-amber-200 font-bold shadow-xs'
          : 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/80 dark:text-amber-300'
      }`}
    >
      {t.estado ? t.estado.replace('_', ' ') : 'pendiente'}
    </span>

    {(t.medio_pago || t.tipo_pago_elegido) && (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md capitalize dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
        <CreditCard className="w-2.5 h-2.5" />
        {t.medio_pago || t.tipo_pago_elegido}
      </span>
    )}
  </div>

  {/* Barra de Botones de Acción */}
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