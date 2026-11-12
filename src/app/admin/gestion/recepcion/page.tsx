'use client'
import Link from 'next/link'
import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Reserva } from '@/app/admin/turnos/components/types'
import { Search, RefreshCw, UserPlus, Edit3, Heart, MessageCircle, FileText, Check, ClipboardList, FolderClock, NotepadText, Clock, Phone, Calendar, ArrowLeft, Zap, Scissors, X } from 'lucide-react'
import ModalNuevoTurnoRecepcion from './components/ModalNuevoTurnoRecepcion'
import ModalAnamnesisRecepcion from './components/ModalAnamnesisRecepcion'
import ModalHistorialCliente from './components/ModalHistorialCliente'
import ModalCobro from '@/app/admin/turnos/components/modals/ModalCobro'
import BotonAvisoGabinete from './components/BotonAvisoGabinete'

// ✨ Variantes de animación (solo UI)
const contenedorVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

const seccionVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
}

const heroVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

// Envoltorio animado para cada bloque (hereda el stagger del contenedor)
const Seccion = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div variants={seccionVariants} className={className}>
    {children}
  </motion.div>
)

// Solo UI: colores según el estado del turno (barra lateral + badge)
const estiloEstado = (estado?: string) => {
  if (estado === 'en_gabinete') {
    return {
      barra: 'bg-sky-500',
      badge: 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60',
    }
  }
  if (estado === 'completado' || estado === 'atendido') {
    return {
      barra: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60',
    }
  }
  if (estado === 'en_espera') {
    return {
      barra: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60',
    }
  }
  return {
    barra: 'bg-slate-300 dark:bg-zinc-600',
    badge: 'bg-slate-100 text-slate-600 border-slate-200/70 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  }
}

export default function RecepcionPage() {
  const reducirMovimiento = useReducedMotion()
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

  // ─── Solo UI: datos derivados para chips y contadores (no tocan lógica ni datos) ───
  const anamnesisPendientes = turnos.filter(
    (t) => t.servicio_tipo !== 'general' && t.estado !== 'completado' && !tieneAnamnesisCompletada(t)
  ).length
  const totalLaser = turnos.filter((t) => (t.servicio_tipo || 'laser') === 'laser').length
  const totalGeneral = turnos.filter((t) => (t.servicio_tipo || 'laser') === 'general').length
  const formatearFecha = (iso: string) => iso.split('-').reverse().join('/')

  const tarjetasKpi = [
    {
      id: 'todos',
      label: 'Total turnos',
      valor: kpis.total,
      icono: Calendar,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30',
      activo: 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 dark:bg-blue-500/10',
      hover: 'hover:border-blue-300 dark:hover:border-blue-800/60',
      labelColor: 'text-slate-400 dark:text-zinc-400',
    },
    {
      id: 'espera',
      label: 'En sala / espera',
      valor: kpis.enEspera,
      icono: Clock,
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30',
      activo: 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 dark:bg-amber-500/10',
      hover: 'hover:border-amber-300 dark:hover:border-amber-800/60',
      labelColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'gabinete',
      label: 'En gabinete',
      valor: kpis.enGabinete,
      icono: Scissors,
      iconBg: 'bg-gradient-to-br from-sky-500 to-sky-600 shadow-sky-500/30',
      activo: 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 dark:bg-sky-500/10',
      hover: 'hover:border-sky-300 dark:hover:border-sky-800/60',
      labelColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      id: 'completados',
      label: 'Atendidos',
      valor: kpis.completados,
      icono: Check,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30',
      activo: 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:bg-emerald-500/10',
      hover: 'hover:border-emerald-300 dark:hover:border-emerald-800/60',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

 return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans transition-colors pb-12">
      
      {/* 🟦🟪 HERO FINTECH: DEGRADADO AZUL → ÍNDIGO → VIOLETA CON ORBES DE LUZ */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 dark:from-blue-950 dark:via-indigo-950 dark:to-zinc-900 pt-6 pb-24 px-4 sm:px-6 lg:px-8 text-white shadow-lg transition-colors">
        {/* Orbes decorativos (capa recortada propia, no interactiva) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="absolute -right-20 top-2 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        <motion.div
          variants={contenedorVariants}
          initial="hidden"
          animate="show"
          className="relative max-w-7xl mx-auto space-y-5"
        >
          
          {/* BOTÓN VOLVER & ACCIONES ENCABEZADO */}
          <motion.div variants={heroVariants} className="flex items-center justify-between">
            <motion.div
              whileTap={{ scale: 0.92 }}
              whileHover={reducirMovimiento ? undefined : { x: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link
                href="/admin"
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/20 transition-colors shadow-xs cursor-pointer flex items-center gap-2 text-xs font-semibold"
                title="Volver al Menú Admin"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline"></span>
              </Link>
            </motion.div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm rounded-2xl px-3.5 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={fetchTurnos}
                disabled={loading}
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 transition-colors cursor-pointer text-white disabled:opacity-70"
                title="Refrescar datos"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </motion.div>

          {/* TÍTULO Y BOTÓN DE NUEVO TURNO */}
          <motion.div variants={heroVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-inner">
                <NotepadText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  Recepción · Control Diario
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                </h1>
                <p className="text-xs text-blue-100/80 mt-0.5">
                  Gestión fluida de ingresos, sala de espera y pases a gabinete
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={reducirMovimiento ? undefined : { y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              type="button"
              onClick={() => { setTurnoAEditar(null); setModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-extrabold rounded-2xl transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer shrink-0"
            >
              <UserPlus className="h-4 w-4 text-indigo-700" />
              <span>Nuevo Turno</span>
            </motion.button>
          </motion.div>

          {/* Chips de estado en vivo (datos ya cargados) */}
          <motion.div variants={heroVariants} className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Actualizando
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Sincronizado
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tabular-nums text-white/90 backdrop-blur-md">
              <Calendar className="h-3 w-3" />
              {formatearFecha(fechaSeleccionada)}
            </span>

            <AnimatePresence>
              {!loading && kpis.enEspera > 0 && (
                <motion.span
                  key="chip-espera"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-400/20 px-3 py-1.5 text-[11px] font-bold text-amber-50 backdrop-blur-md"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                  </span>
                  <motion.span
                    key={kpis.enEspera}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="font-black tabular-nums"
                  >
                    {kpis.enEspera}
                  </motion.span>
                  en sala de espera
                </motion.span>
              )}

              {!loading && kpis.enGabinete > 0 && (
                <motion.span
                  key="chip-gabinete"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200/40 bg-sky-400/20 px-3 py-1.5 text-[11px] font-bold text-sky-50 backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-sky-300" />
                  <span className="font-black tabular-nums">{kpis.enGabinete}</span>
                  en gabinete
                </motion.span>
              )}

              {!loading && anamnesisPendientes > 0 && (
                <motion.span
                  key="chip-anamnesis"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/40 bg-fuchsia-400/20 px-3 py-1.5 text-[11px] font-bold text-fuchsia-50 backdrop-blur-md"
                >
                  <ClipboardList className="h-3 w-3" />
                  <span className="font-black tabular-nums">{anamnesisPendientes}</span>
                  {anamnesisPendientes === 1 ? 'anamnesis pendiente' : 'anamnesis pendientes'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>

      {/* ⬜ CONTENEDOR PRINCIPAL FLOTANTE */}
      <motion.div
        variants={contenedorVariants}
        initial="hidden"
        animate="show"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 space-y-5"
      >
        
        {/* CARDS KPIS Clickeables (bento flotante de vidrio) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {tarjetasKpi.map((k) => {
            const Icono = k.icono
            const seleccionada = filtroEstado === k.id
            return (
              <motion.button
                key={k.id}
                variants={seccionVariants}
                whileHover={reducirMovimiento ? undefined : { y: -4 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setFiltroEstado(k.id)}
                aria-pressed={seleccionada}
                className={`group relative p-4 sm:p-5 rounded-[28px] border text-left backdrop-blur-xl transition-colors duration-200 cursor-pointer shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                  seleccionada
                    ? k.activo
                    : `bg-white/80 dark:bg-zinc-900/80 border-slate-200/80 dark:border-zinc-800 ${k.hover}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${k.iconBg}`}>
                    <Icono className="h-4 w-4" />
                  </div>
                  {seleccionada && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="h-2 w-2 rounded-full bg-current text-slate-400 dark:text-zinc-500"
                    />
                  )}
                </div>
                <p className={`mt-3 text-[11px] font-bold tracking-wide ${k.labelColor}`}>{k.label}</p>
                <motion.p
                  key={k.valor}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="text-3xl font-black tracking-tight mt-0.5 tabular-nums text-slate-900 dark:text-zinc-100"
                >
                  {k.valor}
                </motion.p>
              </motion.button>
            )
          })}
        </div>

        {/* BUSCADOR ANCHO COMPLETO */}
        <Seccion>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-200 focus-within:border-blue-400 dark:focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-none placeholder:text-slate-400"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </Seccion>

        {/* LISTA DE TURNOS (CONTENEDOR PRINCIPAL) */}
        <Seccion>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-[28px] shadow-xl p-5 sm:p-6 space-y-5">
          
          {/* PESTAÑAS DE NAVEGACIÓN (LÁSER VS GENERALES) con indicador deslizante */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setTipoServicioTab('laser')}
              className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                tipoServicioTab === 'laser'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {tipoServicioTab === 'laser' && (
                <motion.span
                  layoutId="recepcion-tipo-activo"
                  transition={reducirMovimiento ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-zinc-900"
                />
              )}
              <Zap className="relative z-10 w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
              <span className="relative z-10">Jornada Láser</span>
              <span className="relative z-10 rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                {totalLaser}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setTipoServicioTab('general')}
              className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                tipoServicioTab === 'general'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {tipoServicioTab === 'general' && (
                <motion.span
                  layoutId="recepcion-tipo-activo"
                  transition={reducirMovimiento ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-zinc-900"
                />
              )}
              <Heart className="relative z-10 w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span className="relative z-10">Servicios Generales</span>
              <span className="relative z-10 rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                {totalGeneral}
              </span>
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-zinc-100">Agenda del Día</h2>
            <AnimatePresence>
              {filtroEstado !== 'todos' && (
                <motion.button
                  key="filtro-activo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  type="button"
                  onClick={() => setFiltroEstado('todos')}
                  title="Quitar filtro"
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-zinc-700 font-medium cursor-pointer hover:bg-slate-200/70 dark:hover:bg-zinc-700 transition-colors"
                >
                  <span>
                    Filtrando por: <strong className="text-blue-600 dark:text-blue-400 uppercase">{filtroEstado}</strong>
                  </span>
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-zinc-800/60"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          ) : turnosFiltrados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 text-center py-12 text-xs text-slate-400"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800">
                <Calendar className="h-5 w-5" />
              </div>
              No se encontraron turnos con el filtro seleccionado.
            </motion.div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${tipoServicioTab}-${filtroEstado}`}
                variants={contenedorVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="space-y-4"
              >
              {turnosFiltrados.map((t) => {
                const horaStr = t.fecha_hora_inicio
                  ? new Date(t.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'

                const detalleTexto = obtenerDetalleTexto(t)
                const celularLimpio = (t.cliente_celular || '').replace(/\D/g, '')
                const mensajeWa = encodeURIComponent(`Hola ${t.cliente_nombre || ''}! Te escribimos de Luminares Estética por tu turno programado para hoy a las ${horaStr} hs (${detalleTexto}). ¡Te esperamos!`)
                const anamnesisLista = tieneAnamnesisCompletada(t)
                const estilo = estiloEstado(t.estado)

                return (
                  <motion.div
                    key={t.id}
                    variants={seccionVariants}
                    className={`group/turno relative overflow-hidden p-5 pl-6 rounded-2xl border transition-all duration-200 space-y-4 shadow-md hover:shadow-xl ${
                      t.servicio_tipo === 'general'
                        ? 'border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/40 via-white to-transparent dark:from-purple-950/20 dark:to-zinc-900'
                        : 'border-slate-200/80 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-blue-300 dark:hover:border-blue-800/60'
                    }`}
                  >
                    {/* Barra lateral de estado */}
                    <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${estilo.barra}`} />

                    {/* CABECERA TARJETA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 px-3 py-1 rounded-xl text-slate-800 dark:text-zinc-100 shadow-2xs">
                          {horaStr} hs
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider border ${estilo.badge}`}>
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
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer border hover:scale-105 active:scale-95 ${
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
                          className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Ver Historial del Cliente"
                        >
                          <FolderClock className="h-4 w-4" />
                        </button>

                        {celularLimpio && (
                          <a
                            href={`https://wa.me/${celularLimpio}?text=${mensajeWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 border border-slate-200/80 dark:border-zinc-700"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => { setTurnoAEditar(t); setModalOpen(true); }}
                          className="p-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Editar Turno / Zonas"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* DATOS CLIENTE Y ZONAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white/90 dark:bg-zinc-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
                      <div>
                        <p className="font-black tracking-tight text-sm sm:text-base text-slate-900 dark:text-zinc-100">
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
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1 tabular-nums">
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
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => guardarNotaRecepcion(t)}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 cursor-pointer border border-slate-200/80 dark:border-zinc-700"
                          title="Guardar nota"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.estado !== 'en_espera' && t.estado !== 'en_gabinete' && t.estado !== 'completado' && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => cambiarEstado(t.id, 'en_espera')}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-colors shadow-md shadow-amber-500/25 cursor-pointer"
                          >
                            Marcar Llegada (Espera)
                          </motion.button>
                        )}

                        {(t.estado === 'en_espera' || t.estado === 'pendiente_sena' || t.estado === 'pendiente') && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => cambiarEstado(t.id, 'en_gabinete')}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl transition-colors shadow-md shadow-sky-500/25 cursor-pointer"
                          >
                            Pasar a Gabinete
                          </motion.button>
                        )}

                        {t.estado === 'en_gabinete' && (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3.5 py-2 rounded-xl border border-sky-200/60 dark:border-sky-800/40">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                            </span>
                            En atención clínica...
                          </span>
                        )}

                        {(t.estado === 'atendido' || t.estado === 'completado') && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setTurnoCobro(t)}
                            className="w-full sm:w-auto text-xs font-bold px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-colors shadow-md shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>{t.estado === 'completado' ? 'Editar Cobro' : 'Cobrar y Completar'}</span>
                          </motion.button>
                        )}

                        {t.estado === 'completado' && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                            Atendido ✔
                          </span>
                        )}
                      </div>
                    </div>

                  </motion.div>
                )
              })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
        </Seccion>
      </motion.div>

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