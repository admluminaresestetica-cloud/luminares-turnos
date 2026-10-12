'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { Search, RefreshCw, UserPlus, Edit3, MessageCircle, DollarSign, FileText, Check } from 'lucide-react'
import ModalNuevoTurnoRecepcion from './components/ModalNuevoTurnoRecepcion'

export default function RecepcionPage() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [busqueda, setBusqueda] = useState<string>('')
  
  // Modales
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [turnoAEditar, setTurnoAEditar] = useState<Reserva | null>(null)

  // Notas locales por ID de turno para escritura rápida
  const [notasLocales, setNotasLocales] = useState<{ [key: string]: string }>({})

  // Cargar turnos desde Supabase para la fecha seleccionada
  const fetchTurnos = async () => {
    setLoading(true)
    try {
      const inicioDia = `${fechaSeleccionada}T00:00:00.000Z`
      const finDia = `${fechaSeleccionada}T23:59:59.999Z`

      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha_hora_inicio', inicioDia)
        .lte('fecha_hora_inicio', finDia)
        .order('fecha_hora_inicio', { ascending: true })

      if (error) throw error
      const turnosData = (data as Reserva[]) || []
      setTurnos(turnosData)

      // Inicializar notas en estado local
      const notasInit: { [key: string]: string } = {}
      turnosData.forEach((t) => {
        const detalle = typeof t.detalle_reserva === 'string' 
          ? JSON.parse(t.detalle_reserva || '{}') 
          : t.detalle_reserva || {}
        notasInit[t.id] = detalle.nota_recepcion || ''
      })
      setNotasLocales(notasInit)

    } catch (err: any) {
      console.error('Error al cargar turnos en Recepción:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurnos()
  }, [fechaSeleccionada])

  // Actualizar estado del turno
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado, modificado_por_admin: true })
        .eq('id', id)

      if (error) throw error

      setTurnos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
      )
    } catch (err: any) {
      alert('Error al actualizar el estado: ' + err.message)
    }
  }

  // Guardar Nota de Recepción en el JSONB
  const guardarNotaRecepcion = async (turno: Reserva) => {
    try {
      const notaActual = notasLocales[turno.id] || ''
      let detalleObj = typeof turno.detalle_reserva === 'string'
        ? JSON.parse(turno.detalle_reserva || '{}')
        : turno.detalle_reserva || {}

      detalleObj = { ...detalleObj, nota_recepcion: notaActual }

      const { error } = await supabase
        .from('reservas')
        .update({ detalle_reserva: detalleObj })
        .eq('id', turno.id)

      if (error) throw error
      alert('Nota guardada correctamente.')
    } catch (err: any) {
      alert('Error al guardar nota: ' + err.message)
    }
  }

  // Filtrado local por búsqueda de texto
  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      if (!busqueda.trim()) return true
      const q = busqueda.toLowerCase()
      const nombre = (t.cliente_nombre || '').toLowerCase()
      const celular = (t.cliente_celular || '').toLowerCase()
      const codigo = (t.codigo_unico || '').toLowerCase()
      return nombre.includes(q) || celular.includes(q) || codigo.includes(q)
    })
  }, [turnos, busqueda])

  // KPIs de resumen
  const kpis = useMemo(() => {
    return {
      total: turnos.length,
      enEspera: turnos.filter((t) => t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente').length,
      enGabinete: turnos.filter((t) => t.estado === 'en_gabinete').length,
      completados: turnos.filter((t) => t.estado === 'completado').length,
    }
  }, [turnos])

  // Helper para extraer texto del detalle de la reserva
  const obtenerDetalleTexto = (t: Reserva) => {
    if (!t.detalle_reserva) return t.servicio_tipo || 'Servicio Láser'
    let det = t.detalle_reserva
    if (typeof det === 'string') {
      try { det = JSON.parse(det) } catch (e) { return det }
    }
    return det.detalle_texto || det.nombre || t.servicio_tipo || 'Turno Láser'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 text-slate-900 dark:text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Recepción - Control Diario</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Gestión de ingresos, sala de espera y pases a gabinete
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={fetchTurnos}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-95"
            title="Refrescar datos"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-zinc-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => { setTurnoAEditar(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Turno</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* CARDS KPIS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Turnos</p>
            <p className="text-2xl font-bold mt-1">{kpis.total}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">En Sala / Pendientes</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">{kpis.enEspera}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">En Gabinete</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{kpis.enGabinete}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Atendidos</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{kpis.completados}</p>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* LISTA DE TURNOS DE RECEPCIÓN */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden p-4 sm:p-6">
          <h2 className="text-base font-bold mb-4">Agenda del Día</h2>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Cargando turnos...</div>
          ) : turnosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">No hay turnos registrados para esta fecha.</div>
          ) : (
            <div className="space-y-4">
              {turnosFiltrados.map((t) => {
                const horaStr = t.fecha_hora_inicio
                  ? new Date(t.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'

                const detalleTexto = obtenerDetalleTexto(t)
                const celularLimpio = (t.cliente_celular || '').replace(/\D/g, '')
                const mensajeWa = encodeURIComponent(`Hola ${t.cliente_nombre || ''}! Te escribimos de Luminares Estética por tu turno programado para hoy a las ${horaStr} hs (${detalleTexto}). ¡Te esperamos!`)

                return (
                  <div
                    key={t.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 space-y-3"
                  >
                    {/* CABECERA TARJETA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2.5 py-1 rounded-xl">
                          {horaStr} hs
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                          {t.estado || 'pendiente'}
                        </span>
                        {t.codigo_unico && (
                          <span className="text-[11px] text-slate-400 font-mono">#{t.codigo_unico}</span>
                        )}
                      </div>

                      {/* BOTONES ACCESOS RÁPIDOS (WHATSAPP + EDITAR) */}
                      <div className="flex items-center gap-1.5">
                        {celularLimpio && (
                          <a
                            href={`https://wa.me/${celularLimpio}?text=${mensajeWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition-all"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => { setTurnoAEditar(t); setModalOpen(true); }}
                          className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 rounded-xl transition-all"
                          title="Editar Turno / Zonas"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* DATOS DEL CLIENTE Y DETALLE ZONAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-900/80 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {t.cliente_nombre || 'Cliente sin nombre'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          📱 {t.cliente_celular || 'Sin celular registrado'}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center sm:items-end">
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Detalle / Zonas:</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 text-left sm:text-right">
                          {detalleTexto}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          Total: ${Number(t.precio_total || 0).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {/* NOTAS DE RECEPCIÓN Y CAMBIO DE ESTADO */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      {/* NOTAS INTERNAS */}
                      <div className="flex-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Nota interna de recepción..."
                          value={notasLocales[t.id] ?? ''}
                          onChange={(e) => setNotasLocales({ ...notasLocales, [t.id]: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                        <button
                          onClick={() => guardarNotaRecepcion(t)}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all shrink-0"
                          title="Guardar nota"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* BOTONES DE FLUJO (LLEGADA / GABINETE) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {t.estado !== 'en_espera' && t.estado !== 'en_gabinete' && t.estado !== 'completado' && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'en_espera')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all active:scale-95 shadow-xs"
                          >
                            Marcar Llegada (Espera)
                          </button>
                        )}

                        {(t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente') && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'en_gabinete')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-xs"
                          >
                            Pasar a Gabinete
                          </button>
                        )}

                        {t.estado === 'en_gabinete' && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'completado')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 shadow-xs"
                          >
                            Finalizar Atención
                          </button>
                        )}

                        {t.estado === 'completado' && (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            Atendido ✔
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO / EDITAR TURNO */}
      <ModalNuevoTurnoRecepcion
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setTurnoAEditar(null); }}
        onSuccess={fetchTurnos}
        turnoAEditar={turnoAEditar}
      />
    </div>
  )
}
