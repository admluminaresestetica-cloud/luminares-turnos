'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { Search, RefreshCw, UserPlus, Edit3, MessageCircle, FileText, Check, ClipboardList, FolderClock } from 'lucide-react'
import ModalNuevoTurnoRecepcion from './components/ModalNuevoTurnoRecepcion'
import ModalAnamnesisRecepcion from './components/ModalAnamnesisRecepcion'
import ModalHistorialCliente from './components/ModalHistorialCliente'

export default function RecepcionPage() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [busqueda, setBusqueda] = useState<string>('')
  
  // Filtro de Estado activo desde las tarjetas superiores: 'todos' | 'espera' | 'gabinete' | 'completados'
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Modales
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [turnoAEditar, setTurnoAEditar] = useState<Reserva | null>(null)

  const [modalAnamnesisOpen, setModalAnamnesisOpen] = useState<boolean>(false)
  const [turnoAnamnesis, setTurnoAnamnesis] = useState<Reserva | null>(null)

  // Modal Historial
  const [modalHistorialOpen, setModalHistorialOpen] = useState<boolean>(false)
  const [clienteHistorial, setClienteHistorial] = useState<{ celular: string; nombre: string }>({ celular: '', nombre: '' })

  const [notasLocales, setNotasLocales] = useState<{ [key: string]: string }>({})

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

  const abrirHistorial = (celular: string, nombre: string) => {
    if (!celular) {
      alert('Este paciente no tiene registrado un número de celular.')
      return
    }
    setClienteHistorial({ celular, nombre })
    setModalHistorialOpen(true)
  }

  const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      // 1. Filtro por búsqueda de texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase()
        const nombre = (t.cliente_nombre || '').toLowerCase()
        const celular = (t.cliente_celular || '').toLowerCase()
        const codigo = (t.codigo_unico || '').toLowerCase()
        if (!nombre.includes(q) && !celular.includes(q) && !codigo.includes(q)) {
          return false
        }
      }

      // 2. Filtro por estado activado desde las tarjetas superiores
      if (filtroEstado === 'espera') {
        return t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente'
      }
      if (filtroEstado === 'gabinete') {
        return t.estado === 'en_gabinete'
      }
      if (filtroEstado === 'completados') {
        return t.estado === 'completado'
      }

      return true // 'todos'
    })
  }, [turnos, busqueda, filtroEstado])

  const kpis = useMemo(() => {
    return {
      total: turnos.length,
      enEspera: turnos.filter((t) => t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente').length,
      enGabinete: turnos.filter((t) => t.estado === 'en_gabinete').length,
      completados: turnos.filter((t) => t.estado === 'completado').length,
    }
  }, [turnos])

  const obtenerDetalleTexto = (t: Reserva) => {
    if (!t.detalle_reserva) return t.servicio_tipo || 'Servicio Láser'
    let det = t.detalle_reserva
    if (typeof det === 'string') {
      try { det = JSON.parse(det) } catch (e) { return det }
    }
    return det.detalle_texto || det.nombre || t.servicio_tipo || 'Turno Láser'
  }

  const tieneAnamnesisCompletada = (t: Reserva) => {
    if (!t.detalle_reserva) return false
    let det = t.detalle_reserva
    if (typeof det === 'string') {
      try { det = JSON.parse(det) } catch (e) { return false }
    }
    return Boolean(det.anamnesis?.completado)
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
        {/* CARDS KPIS Clickeables para Filtrar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'todos'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
            }`}
          >
            <p className={`text-xs font-medium ${filtroEstado === 'todos' ? 'opacity-80' : 'text-slate-500 dark:text-zinc-400'}`}>
              Total Turnos
            </p>
            <p className="text-2xl font-bold mt-1">{kpis.total}</p>
          </button>

          <button
            onClick={() => setFiltroEstado('espera')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'espera'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:border-amber-300'
            }`}
          >
            <p className={`text-xs font-medium ${filtroEstado === 'espera' ? 'text-white/90' : 'text-amber-700 dark:text-amber-400'}`}>
              En Sala / Pendientes
            </p>
            <p className={`text-2xl font-bold mt-1 ${filtroEstado === 'espera' ? 'text-white' : 'text-amber-900 dark:text-amber-300'}`}>
              {kpis.enEspera}
            </p>
          </button>

          <button
            onClick={() => setFiltroEstado('gabinete')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'gabinete'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 hover:border-blue-300'
            }`}
          >
            <p className={`text-xs font-medium ${filtroEstado === 'gabinete' ? 'text-white/90' : 'text-blue-700 dark:text-blue-400'}`}>
              En Gabinete
            </p>
            <p className={`text-2xl font-bold mt-1 ${filtroEstado === 'gabinete' ? 'text-white' : 'text-blue-900 dark:text-blue-300'}`}>
              {kpis.enGabinete}
            </p>
          </button>

          <button
            onClick={() => setFiltroEstado('completados')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filtroEstado === 'completados'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300'
            }`}
          >
            <p className={`text-xs font-medium ${filtroEstado === 'completados' ? 'text-white/90' : 'text-emerald-700 dark:text-emerald-400'}`}>
              Atendidos
            </p>
            <p className={`text-2xl font-bold mt-1 ${filtroEstado === 'completados' ? 'text-white' : 'text-emerald-900 dark:text-emerald-300'}`}>
              {kpis.completados}
            </p>
          </button>
        </div>

        {/* BUSCADOR ANCHO COMPLETO */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* LISTA DE TURNOS */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Agenda del Día</h2>
            {filtroEstado !== 'todos' && (
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg font-medium">
                Filtrando por: <strong className="text-slate-800 dark:text-zinc-200 uppercase">{filtroEstado}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Cargando turnos...</div>
          ) : turnosFiltrados.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No se encontraron turnos con el filtro seleccionado.
            </div>
          ) : (
            <div className="space-y-4">
              {turnosFiltrados.map((t) => {
                const horaStr = t.fecha_hora_inicio
                  ? new Date(t.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'

                const detalleTexto = obtenerDetalleTexto(t)
                const celularLimpio = (t.cliente_celular || '').replace(/\D/g, '')
                const mensajeWa = encodeURIComponent(`Hola ${t.cliente_nombre || ''}! Te escribimos de Luminares Estética por tu turno programado para hoy a las ${horaStr} hs (${detalleTexto}). ¡Te esperamos!`)
                const anamnesisLista = tieneAnamnesisCompletada(t)

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
                        
                        {/* BADGE ANAMNESIS */}
                        <button
                          onClick={() => { setTurnoAnamnesis(t); setModalAnamnesisOpen(true); }}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                            anamnesisLista
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          <span>{anamnesisLista ? 'Anamnesis ✔' : 'Anamnesis Pendiente ⚠️'}</span>
                        </button>

                        {t.codigo_unico && (
                          <span className="text-[11px] text-slate-400 font-mono">#{t.codigo_unico}</span>
                        )}
                      </div>

                      {/* BOTONES ACCESOS RÁPIDOS */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => abrirHistorial(t.cliente_celular || '', t.cliente_nombre || 'Cliente')}
                          className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all cursor-pointer"
                          title="Ver Historial del Cliente"
                        >
                          <FolderClock className="h-4 w-4" />
                        </button>

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
                          className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 rounded-xl transition-all cursor-pointer"
                          title="Editar Turno / Zonas"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* DATOS CLIENTE Y ZONAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-900/80 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {t.cliente_nombre || 'Cliente sin nombre'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                          <span>📱 {t.cliente_celular || 'Sin celular registrado'}</span>
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

                    {/* NOTAS Y CAMBIO DE ESTADO */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
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
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
                          title="Guardar nota"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.estado !== 'en_espera' && t.estado !== 'en_gabinete' && t.estado !== 'completado' && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'en_espera')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            Marcar Llegada (Espera)
                          </button>
                        )}

                        {(t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente') && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'en_gabinete')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            Pasar a Gabinete
                          </button>
                        )}

                        {t.estado === 'en_gabinete' && (
                          <button
                            onClick={() => cambiarEstado(t.id, 'completado')}
                            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
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

      {/* MODALES */}
      <ModalNuevoTurnoRecepcion
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setTurnoAEditar(null); }}
        onSuccess={fetchTurnos}
        turnoAEditar={turnoAEditar}
      />

      <ModalAnamnesisRecepcion
        isOpen={modalAnamnesisOpen}
        onClose={() => { setModalAnamnesisOpen(false); setTurnoAnamnesis(null); }}
        onSuccess={fetchTurnos}
        turno={turnoAnamnesis}
      />

      <ModalHistorialCliente
        isOpen={modalHistorialOpen}
        onClose={() => setModalHistorialOpen(false)}
        celular={clienteHistorial.celular}
        nombreCliente={clienteHistorial.nombre}
      />
    </div>
  )
}