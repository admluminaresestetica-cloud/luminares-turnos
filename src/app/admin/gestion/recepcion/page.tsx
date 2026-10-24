'use client'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { Search, RefreshCw, UserPlus, Edit3, Heart, MessageCircle, FileText, Check, ClipboardList, FolderClock, NotepadText, Clock, Phone, Calendar, ArrowLeft, Zap, Scissors } from 'lucide-react'
import ModalNuevoTurnoRecepcion from './components/ModalNuevoTurnoRecepcion'
import ModalAnamnesisRecepcion from './components/ModalAnamnesisRecepcion'
import ModalHistorialCliente from './components/ModalHistorialCliente'
import ModalCobro from '@/app/admin/turnos/components/modals/ModalCobro'
import BotonAvisoGabinete from './components/BotonAvisoGabinete'

export default function RecepcionPage() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [busqueda, setBusqueda] = useState<string>('')

  // Solapa activa: 'laser' | 'general'
  const [tipoServicioTab, setTipoServicioTab] = useState<'laser' | 'general'>('laser')
  
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
  
  // Estados para Modal de Cobro
  const [turnoCobro, setTurnoCobro] = useState<Reserva | null>(null)
  const [medioPago, setMedioPago] = useState<string>('efectivo')
  const [guardandoCobro, setGuardandoCobro] = useState<boolean>(false)

  const [notasLocales, setNotasLocales] = useState<{ [key: string]: string }>({})

  const fetchTurnos = async () => {
    setLoading(true)
    try {
        const inicioDia = `${fechaSeleccionada}T00:00:00.000-03:00`
        const finDia = `${fechaSeleccionada}T23:59:59.999-03:00`

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

  const confirmarCobro = async () => {
    if (!turnoCobro) return
    setGuardandoCobro(true)
    try {
      const { error } = await supabase
        .from('reservas')
        .update({
          estado: 'completado',
          medio_pago: medioPago,
          estado_pago: 'pagado',
          modificado_por_admin: true
        })
        .eq('id', turnoCobro.id)

      if (error) throw error

      setTurnoCobro(null)
      fetchTurnos()
    } catch (err: any) {
      alert('Error al registrar el cobro: ' + err.message)
    } finally {
      setGuardandoCobro(false)
    }
  }

const turnosFiltrados = useMemo(() => {
    return turnos.filter((t) => {
      // 0. Filtro por solapa de tipo de servicio (Láser vs General)
      const tipoServicioReserva = t.servicio_tipo || 'laser'
      if (tipoServicioReserva !== tipoServicioTab) {
        return false
      }

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
  }, [turnos, busqueda, filtroEstado, tipoServicioTab])

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
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans transition-colors pb-12">
      
      {/* 🟦 HERO SECTION CON DEGRADADO AZUL FINTECH */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 dark:from-blue-950 dark:via-blue-900 dark:to-zinc-900 pt-6 pb-20 px-4 sm:px-6 lg:px-8 text-white shadow-lg">
        <div className="max-w-7xl mx-auto space-y-5">
          
          {/* BOTÓN VOLVER & ACCIONES ENCABEZADO */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/20 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Volver al Menú Admin"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Menú Principal</span>
            </Link>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm rounded-2xl px-3.5 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
              />
              <button
                type="button"
                onClick={fetchTurnos}
                disabled={loading}
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 transition-all active:scale-95 cursor-pointer text-white"
                title="Refrescar datos"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* TÍTULO Y BOTÓN DE NUEVO TURNO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-inner">
                <NotepadText className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Recepción · Control Diario
                </h1>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  Gestión fluida de ingresos, sala de espera y pases a gabinete
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setTurnoAEditar(null); setModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-blue-50 text-blue-700 text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
            >
              <UserPlus className="h-4 w-4 text-blue-700" />
              <span>Nuevo Turno</span>
            </button>
          </div>

        </div>
      </div>

      {/* ⬜ CONTENEDOR PRINCIPAL FLOTANTE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 space-y-5">
        
        {/* CARDS KPIS Clickeables (Efecto Flotante) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setFiltroEstado('todos')}
            className={`p-4 sm:p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-md hover:-translate-y-0.5 ${
              filtroEstado === 'todos'
                ? 'bg-white dark:bg-zinc-900 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-white/60 dark:border-zinc-800 hover:border-blue-300'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">Total Turnos</p>
            <p className="text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-zinc-100">{kpis.total}</p>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('espera')}
            className={`p-4 sm:p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-md hover:-translate-y-0.5 ${
              filtroEstado === 'espera'
                ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-white/60 dark:border-zinc-800 hover:border-amber-300'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">En Sala / Espera</p>
            <p className="text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-zinc-100">{kpis.enEspera}</p>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('gabinete')}
            className={`p-4 sm:p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-md hover:-translate-y-0.5 ${
              filtroEstado === 'gabinete'
                ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500 ring-2 ring-sky-500/20'
                : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-white/60 dark:border-zinc-800 hover:border-sky-300'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">En Gabinete</p>
            <p className="text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-zinc-100">{kpis.enGabinete}</p>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('completados')}
            className={`p-4 sm:p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-md hover:-translate-y-0.5 ${
              filtroEstado === 'completados'
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-white/60 dark:border-zinc-800 hover:border-emerald-300'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Atendidos</p>
            <p className="text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-zinc-100">{kpis.completados}</p>
          </button>
        </div>

        {/* BUSCADOR ANCHO COMPLETO */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 px-4 py-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* LISTA DE TURNOS (CONTENEDOR PRINCIPAL) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-xl p-5 sm:p-6 space-y-5">
          
          {/* PESTAÑAS DE NAVEGACIÓN (LÁSER VS GENERALES) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setTipoServicioTab('laser')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                tipoServicioTab === 'laser'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
              <span>Jornada Láser</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoServicioTab('general')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                tipoServicioTab === 'general'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span>Servicios Generales</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">Agenda del Día</h2>
            {filtroEstado !== 'todos' && (
              <span className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-zinc-700 font-medium">
                Filtrando por: <strong className="text-blue-600 dark:text-blue-400 uppercase">{filtroEstado}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Cargando turnos...</div>
          ) : turnosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
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
                    className={`p-5 rounded-2xl border transition-all space-y-4 shadow-2xs hover:shadow-md ${
                      t.servicio_tipo === 'general'
                        ? 'border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/40 via-white to-transparent dark:from-purple-950/20 dark:to-zinc-900'
                        : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-blue-300 dark:hover:border-blue-800/60'
                    }`}
                  >
                    {/* CABECERA TARJETA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 px-3 py-1 rounded-xl text-slate-800 dark:text-zinc-100 shadow-2xs">
                          {horaStr} hs
                        </span>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase tracking-wider border border-slate-300/50 dark:border-zinc-700">
                          {t.estado ? t.estado.replace('_', ' ') : 'pendiente'}
                        </span>

                        {/* DISTINTIVO DE TIPO DE SERVICIO */}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider border ${
                          t.servicio_tipo === 'general'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900'
                        }`}>
                          {t.servicio_tipo === 'general' ? (
                            <>
                              <Heart className="w-3.5 h-3.5 fill-rose-500" />
                              <span>General</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-amber-500" />
                              <span>Láser</span>
                            </>
                          )}
                        </span>

                        {/* BADGE ANAMNESIS */}
                        {t.servicio_tipo !== 'general' && (
                          <button
                            type="button"
                            onClick={() => { setTurnoAnamnesis(t); setModalAnamnesisOpen(true); }}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border ${
                              anamnesisLista
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40'
                            }`}
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span>{anamnesisLista ? 'Anamnesis ✔' : 'Anamnesis Pendiente'}</span>
                          </button>
                        )}

                        {t.codigo_unico && (
                          <span className="text-[11px] text-slate-400 font-mono">#{t.codigo_unico}</span>
                        )}
                      </div>

                      {/* BOTONES ACCESOS RÁPIDOS */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <BotonAvisoGabinete gabineteId="1" nombreGabinete="Gabinete 1" />
                        <button
                          type="button"
                          onClick={() => abrirHistorial(t.cliente_celular || '', t.cliente_nombre || 'Cliente')}
                          className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all active:scale-95 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Ver Historial del Cliente"
                        >
                          <FolderClock className="h-4 w-4" />
                        </button>

                        {celularLimpio && (
                          <a
                            href={`https://wa.me/${celularLimpio}?text=${mensajeWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => { setTurnoAEditar(t); setModalOpen(true); }}
                          className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl transition-all active:scale-95 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Editar Turno / Zonas"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* DATOS CLIENTE Y ZONAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
                          {t.cliente_nombre || 'Cliente sin nombre'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {t.cliente_celular || 'Sin celular registrado'}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center sm:items-end">
                        <span className="text-[11px] font-medium text-slate-400">Detalle / Zonas:</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 text-left sm:text-right">
                          {detalleTexto}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
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
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => guardarNotaRecepcion(t)}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-all active:scale-95 shrink-0 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Guardar nota"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.estado !== 'en_espera' && t.estado !== 'en_gabinete' && t.estado !== 'completado' && (
                          <button
                            type="button"
                            onClick={() => cambiarEstado(t.id, 'en_espera')}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            Marcar Llegada (Espera)
                          </button>
                        )}

                        {(t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente') && (
                          <button
                            type="button"
                            onClick={() => cambiarEstado(t.id, 'en_gabinete')}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            Pasar a Gabinete
                          </button>
                        )}

                        {t.estado === 'en_gabinete' && (
                          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3.5 py-2 rounded-xl border border-sky-200/60 dark:border-sky-800/40">
                            En atención clínica...
                          </span>
                        )}

                        {(t.estado === 'atendido' || t.estado === 'completado') && (
                          <button
                            type="button"
                            onClick={() => setTurnoCobro(t)}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>{t.estado === 'completado' ? 'Editar Cobro' : 'Cobrar y Completar'}</span>
                          </button>
                        )}

                        {t.estado === 'completado' && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
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
        tipoServicioInicial={tipoServicioTab}
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

      {/* MODAL DE COBRO INTEGRADO */}
      {turnoCobro && (
        <ModalCobro
          turnoACobrar={turnoCobro}
          medioPagoSeleccionado={medioPago}
          setMedioPagoSeleccionado={setMedioPago}
          guardandoCobro={guardandoCobro}
          onConfirm={confirmarCobro}
          onClose={() => setTurnoCobro(null)}
        />
      )}
    </div>
  )
}