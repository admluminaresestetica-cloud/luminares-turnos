'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ResumenAgenda from '@/components/admin/ResumenAgenda'

interface Reserva {
  id: string
  codigo_unico?: string
  cliente_nombre?: string
  cliente_celular?: string
  servicio_tipo?: string
  detalle_reserva?: any
  precio_total?: number
  duracion_total?: number
  fecha_hora_inicio?: string
  estado?: string
  medio_pago?: string
}

interface ServicioLaser {
  id: string
  genero?: string
  nombre_zona?: string
  categoria_zona?: string
  precio_lista?: number
  duracion_minutos?: number
  activo?: boolean
}

interface PromoLaser {
  id: string
  genero?: string
  nombre_promo?: string
  zonas_incluidas?: string[]
  precio_promo?: number
  duracion_total_min?: number
  permite_swap?: boolean
  activo?: boolean
}

interface ServicioGeneral {
  id: string
  categoria?: string
  subtipo?: string
  precio?: number
  duracion_minutos?: number
  activo?: boolean
  created_at?: string
}

// --- TIPOS PARA CONFIGURACIÓN DE CALENDARIO / HORARIOS ---
interface HorarioDia {
  abierto: boolean
  inicio: string
  fin: string
}

interface HorariosSemana {
  lunes: HorarioDia
  martes: HorarioDia
  miercoles: HorarioDia
  jueves: HorarioDia
  viernes: HorarioDia
  sabado: HorarioDia
  domingo: HorarioDia
}

interface ConfigCalendario {
  id?: string
  tipo_servicio: 'laser' | 'general'
  horarios_atencion?: any
  fechas_habilitadas_laser?: string[]
  updated_at?: string
}

const DIAS_SEMANA: { key: keyof HorariosSemana; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const horarioDiaDefault = (abierto: boolean = true): HorarioDia => ({
  abierto,
  inicio: '09:00',
  fin: '18:00'
})

const horariosSemanaDefault = (): HorariosSemana => ({
  lunes: horarioDiaDefault(true),
  martes: horarioDiaDefault(true),
  miercoles: horarioDiaDefault(true),
  jueves: horarioDiaDefault(true),
  viernes: horarioDiaDefault(true),
  sabado: horarioDiaDefault(false),
  domingo: horarioDiaDefault(false),
})

export default function AdminDashboard() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [servicios, setServicios] = useState<ServicioLaser[]>([])
  const [promos, setPromos] = useState<PromoLaser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPrecios, setLoadingPrecios] = useState(false)

  // Servicios Generales
  const [serviciosGenerales, setServiciosGenerales] = useState<ServicioGeneral[]>([])
  const [loadingGenerales, setLoadingGenerales] = useState(false)

  // Configuración de Calendario / Horarios
  const [configLaser, setConfigLaser] = useState<ConfigCalendario>({
    tipo_servicio: 'laser',
    horarios_atencion: { inicio: '09:00', fin: '18:00' },
    fechas_habilitadas_laser: []
  })
  const [configGeneral, setConfigGeneral] = useState<ConfigCalendario>({
    tipo_servicio: 'general',
    horarios_atencion: { ...horariosSemanaDefault(), excepciones: [] as string[] }
  })
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [guardandoLaser, setGuardandoLaser] = useState(false)
  const [guardandoGeneral, setGuardandoGeneral] = useState(false)
  const [nuevaFechaLaser, setNuevaFechaLaser] = useState<string>('')
  const [nuevaExcepcionGeneral, setNuevaExcepcionGeneral] = useState<string>('')

  // Filtros de Agenda
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [filtroFechaTipo, setFiltroFechaTipo] = useState<'todos' | 'hoy' | 'especifica'>('todos')
  const [fechaEspecifica, setFechaEspecifica] = useState<string>('')

  // Control de Solapas
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'precios' | 'generales' | 'horarios'>('overview')
  const [seccionPrecios, setSeccionPrecios] = useState<'servicios' | 'promos'>('servicios')
  // Modal de Registro de Cobro
  const [turnoACobrar, setTurnoACobrar] = useState<Reserva | null>(null)
  const [medioPagoSeleccionado, setMedioPagoSeleccionado] = useState<string>('efectivo')
  const [guardandoCobro, setGuardandoCobro] = useState(false)

  // Modales - Servicios Laser
  const [modalServicio, setModalServicio] = useState<boolean>(false)
  const [servicioEdit, setServicioEdit] = useState<Partial<ServicioLaser> | null>(null)

  // Modales - Promos
  const [modalPromo, setModalPromo] = useState<boolean>(false)
  const [promoEdit, setPromoEdit] = useState<Partial<PromoLaser> | null>(null)

  // Modales - Servicios Generales
  const [modalGeneral, setModalGeneral] = useState<boolean>(false)
  const [servicioGeneralEdit, setServicioGeneralEdit] = useState<Partial<ServicioGeneral> | null>(null)

  const router = useRouter()

  // --- ESTADOS: SELECCIÓN DE SERVICIOS EN "NUEVO TURNO" ---
  const [tipoTurnoNuevo, setTipoTurnoNuevo] = useState<'laser' | 'general'>('laser')
  const [filtroGeneroLaserNuevo, setFiltroGeneroLaserNuevo] = useState<string>('todos')
  const [zonasSeleccionadasNuevo, setZonasSeleccionadasNuevo] = useState<string[]>([])
  const [servicioGeneralSeleccionadoNuevo, setServicioGeneralSeleccionadoNuevo] = useState<string>('')
  
  // --- CARGA DE DATOS ---
  const fetchTurnos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha_hora_inicio', { ascending: true })

    if (!error && data) {
      setTurnos(data as Reserva[])
    }
    setLoading(false)
  }

  const fetchPreciosYPromos = async () => {
    setLoadingPrecios(true)
    const { data: servData } = await supabase
      .from('servicios_laser')
      .select('*')
      .order('nombre_zona', { ascending: true })

    const { data: promoData } = await supabase
      .from('promos_laser')
      .select('*')
      .order('nombre_promo', { ascending: true })

    if (servData) setServicios(servData as ServicioLaser[])
    if (promoData) setPromos(promoData as PromoLaser[])
    setLoadingPrecios(false)
  }

  const fetchServiciosGenerales = async () => {
    setLoadingGenerales(true)
    const { data, error } = await supabase
      .from('servicios_generales')
      .select('*')
      .order('categoria', { ascending: true })

    if (!error && data) {
      setServiciosGenerales(data as ServicioGeneral[])
    } else if (error) {
      console.error('Error al cargar servicios generales:', error.message)
    }
    setLoadingGenerales(false)
  }

  const fetchConfigCalendario = async () => {
    setLoadingHorarios(true)
    const { data, error } = await supabase
      .from('configuracion_calendario')
      .select('*')

    if (!error && data) {
      const laser = (data as any[]).find((c) => c.tipo_servicio === 'laser')
      const general = (data as any[]).find((c) => c.tipo_servicio === 'general')

      if (laser) {
        setConfigLaser({
          id: laser.id,
          tipo_servicio: 'laser',
          horarios_atencion: laser.horarios_atencion || { inicio: '09:00', fin: '18:00' },
          fechas_habilitadas_laser: laser.fechas_habilitadas_laser || [],
          updated_at: laser.updated_at
        })
      }

      if (general) {
        const horariosBase = general.horarios_atencion || {}
        
        setConfigGeneral({
          id: general.id,
          tipo_servicio: 'general',
          horarios_atencion: {
            ...horariosSemanaDefault(),
            ...horariosBase,
            excepciones: horariosBase.excepciones || []
          },
          updated_at: general.updated_at
        })
      }
    } else if (error) {
      console.error('Error al cargar configuración de calendario:', error.message)
    }
    setLoadingHorarios(false)
  }

  useEffect(() => {
    fetchTurnos()
    fetchPreciosYPromos()
    fetchServiciosGenerales()
    fetchConfigCalendario()
  }, [])

  // --- ACCIONES DE TURNOS ---
  // --- ACCIONES DE TURNOS Y COBRO ---

  // --- ESTADOS: CREAR / EDITAR RESERVA MANUAL ---
interface TurnoForm {
  id?: string
  cliente_nombre: string
  cliente_celular: string
  fecha_hora_local: string // formato datetime-local: YYYY-MM-DDTHH:mm
  detalle_texto: string
  precio_total: number
  estado: string
  metodo_pago: string
}

const turnoFormVacio = (): TurnoForm => ({
  cliente_nombre: '',
  cliente_celular: '',
  fecha_hora_local: '',
  detalle_texto: '',
  precio_total: 0,
  estado: 'pendiente_sena',
  metodo_pago: ''
})

const [modalNuevoTurno, setModalNuevoTurno] = useState<boolean>(false)
const [nuevoTurno, setNuevoTurno] = useState<TurnoForm>(turnoFormVacio())
const [guardandoNuevoTurno, setGuardandoNuevoTurno] = useState(false)

const [modalEditarTurno, setModalEditarTurno] = useState<boolean>(false)
const [turnoEdit, setTurnoEdit] = useState<TurnoForm | null>(null)
const [guardandoEdicionTurno, setGuardandoEdicionTurno] = useState(false)

// --- HELPERS DE FECHA (ISO <-> datetime-local) ---
const isoToDatetimeLocal = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const datetimeLocalToIso = (local: string) => {
  if (!local) return null
  return new Date(local).toISOString()
}

// --- ABRIR MODALES ---
// --- LISTAS ACTIVAS (derivadas de los estados ya cargados) ---
  const serviciosLaserActivos = useMemo(
    () => servicios.filter((s) => s.activo),
    [servicios]
  )

  const serviciosGeneralesActivos = useMemo(
    () => serviciosGenerales.filter((s) => s.activo),
    [serviciosGenerales]
  )

  const zonasLaserFiltradas = useMemo(
    () =>
      serviciosLaserActivos.filter(
        (s) => filtroGeneroLaserNuevo === 'todos' || s.genero === filtroGeneroLaserNuevo
      ),
    [serviciosLaserActivos, filtroGeneroLaserNuevo]
  )

  // --- TOGGLE DE ZONAS LASER SELECCIONADAS ---
  const toggleZonaSeleccionadaNuevo = (id: string) => {
    setZonasSeleccionadasNuevo((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  // --- RECALCULA PRECIO Y DETALLE AUTOMÁTICAMENTE ---
  useEffect(() => {
    if (!modalNuevoTurno) return

    if (tipoTurnoNuevo === 'laser') {
      const zonas = serviciosLaserActivos.filter((s) => zonasSeleccionadasNuevo.includes(s.id))
      const total = zonas.reduce((acc, z) => acc + (Number(z.precio_lista) || 0), 0)
      const detalle = zonas.map((z) => z.nombre_zona).filter(Boolean).join(' + ')
      setNuevoTurno((prev: any) => ({ ...prev, precio_total: total, detalle_texto: detalle }))
    } else {
      const serv = serviciosGeneralesActivos.find((s) => s.id === servicioGeneralSeleccionadoNuevo)
      if (serv) {
        const detalle = [serv.categoria, serv.subtipo].filter(Boolean).join(' - ')
        setNuevoTurno((prev: any) => ({ ...prev, precio_total: Number(serv.precio) || 0, detalle_texto: detalle }))
      } else {
        setNuevoTurno((prev: any) => ({ ...prev, precio_total: 0, detalle_texto: '' }))
      }
    }
  }, [
    tipoTurnoNuevo,
    zonasSeleccionadasNuevo,
    servicioGeneralSeleccionadoNuevo,
    serviciosLaserActivos,
    serviciosGeneralesActivos,
    modalNuevoTurno
  ])

  // --- ABRIR MODAL NUEVO TURNO (Reemplaza la función vieja) ---
  const abrirModalNuevoTurno = () => {
    setNuevoTurno(turnoFormVacio())
    setTipoTurnoNuevo('laser')
    setFiltroGeneroLaserNuevo('todos')
    setZonasSeleccionadasNuevo([])
    setServicioGeneralSeleccionadoNuevo('')
    setModalNuevoTurno(true)
  }

const abrirModalEditarTurno = (t: Reserva) => {
  let detalleTexto = ''
  if (t.detalle_reserva) {
    let detalle = t.detalle_reserva
    if (typeof detalle === 'string') {
      try { detalle = JSON.parse(detalle) } catch { detalle = { detalle_texto: detalle } }
    }
    detalleTexto = detalle?.detalle_texto || renderDetalle(t) || ''
  }

  setTurnoEdit({
    id: t.id,
    cliente_nombre: t.cliente_nombre || '',
    cliente_celular: t.cliente_celular || '',
    fecha_hora_local: isoToDatetimeLocal(t.fecha_hora_inicio),
    detalle_texto: detalleTexto,
    precio_total: Number(t.precio_total) || 0,
    estado: t.estado || 'pendiente_sena',
    metodo_pago: (t as any).metodo_pago || ''
  })
  setModalEditarTurno(true)
}

// --- CREAR RESERVA MANUAL (INSERT) ---
const crearTurnoManual = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!nuevoTurno.cliente_nombre || !nuevoTurno.fecha_hora_local) {
    alert('Completá al menos el nombre del cliente y la fecha/hora del turno.')
    return
  }

  setGuardandoNuevoTurno(true)

  const codigoGenerado = `MANUAL-${Date.now().toString(36).toUpperCase()}`

  // Determinamos la duración exacta según el servicio que ya viene de la base de datos
  let duracionReal = 30 // Valor predeterminado de respaldo

  if (tipoTurnoNuevo === 'laser') {
    duracionReal = zonasSeleccionadasNuevo.reduce((total, idZona) => {
      const zonaEncontrada = servicios.find(s => s.id === idZona)
      return total + (zonaEncontrada?.duracion_minutos || 0)
    }, 0)
  } else {
    // Buscamos el servicio general exacto que el admin seleccionó en el desplegable de la imagen
    const servicioElegido = serviciosGenerales.find(
      (sg) => sg.id === servicioGeneralSeleccionadoNuevo
    )
    if (servicioElegido?.duracion_minutos) {
      duracionReal = servicioElegido.duracion_minutos
    }
  }

  const payload = {
    codigo_unico: codigoGenerado,
    cliente_nombre: nuevoTurno.cliente_nombre,
    cliente_celular: nuevoTurno.cliente_celular,
    fecha_hora_inicio: datetimeLocalToIso(nuevoTurno.fecha_hora_local),
    servicio_tipo: tipoTurnoNuevo,
    duracion_total: duracionReal, // <--- Toma directo los minutos configurados en el servicio general
    detalle_reserva: { detalle_texto: nuevoTurno.detalle_texto },
    precio_total: Number(nuevoTurno.precio_total),
    estado: nuevoTurno.estado,
    metodo_pago: nuevoTurno.metodo_pago,
    modificado_por_admin: true
  }

  const { data, error } = await supabase
    .from('reservas')
    .insert([payload])
    .select()
    .single()

  if (error) {
    alert('Error al crear el turno: ' + error.message)
    setGuardandoNuevoTurno(false)
    return
  }

  if (data) {
    setTurnos((prev) => [...prev, data as Reserva])
  }

  setModalNuevoTurno(false)
  setNuevoTurno(turnoFormVacio())
  setGuardandoNuevoTurno(false)
}

// --- GUARDAR EDICIÓN DE RESERVA (UPDATE) ---
const guardarEdicionTurno = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!turnoEdit?.id) return

  setGuardandoEdicionTurno(true)

  const payload = {
    cliente_nombre: turnoEdit.cliente_nombre,
    cliente_celular: turnoEdit.cliente_celular,
    fecha_hora_inicio: datetimeLocalToIso(turnoEdit.fecha_hora_local),
    detalle_reserva: { detalle_texto: turnoEdit.detalle_texto },
    precio_total: Number(turnoEdit.precio_total),
    estado: turnoEdit.estado,
    metodo_pago: turnoEdit.metodo_pago,
    modificado_por_admin: true
  }

  const { error } = await supabase
    .from('reservas')
    .update(payload)
    .eq('id', turnoEdit.id)

  if (error) {
    alert('Error al actualizar el turno: ' + error.message)
    setGuardandoEdicionTurno(false)
    return
  }

  setTurnos((prev) =>
    prev.map((t) =>
      t.id === turnoEdit.id
        ? {
            ...t,
            cliente_nombre: payload.cliente_nombre,
            cliente_celular: payload.cliente_celular,
            fecha_hora_inicio: payload.fecha_hora_inicio || t.fecha_hora_inicio,
            detalle_reserva: payload.detalle_reserva,
            precio_total: payload.precio_total,
            estado: payload.estado
          }
        : t
    )
  )

  setModalEditarTurno(false)
  setTurnoEdit(null)
  setGuardandoEdicionTurno(false)
}
  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    // Si van a completar el turno, interceptamos y abrimos el modal
    if (nuevoEstado === 'completado') {
      const turno = turnos.find((t) => t.id === id)
      if (turno) {
        setTurnoACobrar(turno)
        setMedioPagoSeleccionado(turno.medio_pago || 'efectivo')
      }
      return
    }

    // Para los demás estados (ej. cancelado, confirmado) actualiza directo
    const { error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado, modificado_por_admin: true })
      .eq('id', id)

    if (!error) {
      setTurnos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t))
      )
    } else {
      alert('Error al actualizar el estado: ' + error.message)
    }
  }

  const confirmarCobro = async () => {
    if (!turnoACobrar) return
    setGuardandoCobro(true)

    const { error } = await supabase
      .from('reservas')
      .update({
        estado: 'completado',
        medio_pago: medioPagoSeleccionado,
        modificado_por_admin: true
      })
      .eq('id', turnoACobrar.id)

    if (!error) {
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === turnoACobrar.id
            ? { ...t, estado: 'completado', medio_pago: medioPagoSeleccionado }
            : t
        )
      )
      setTurnoACobrar(null)
    } else {
      alert('Error al registrar el cobro: ' + error.message)
    }
    setGuardandoCobro(false)
  }

// ==========================================
  // LÓGICA DE RESUMEN PARA LA AGENDA
  // ==========================================
  const turnosAgendaResumen = useMemo(() => {
    return turnos.filter((t) => {
      if (busqueda.trim() !== '') {
        const q = busqueda.toLowerCase()
        const nombre = (t.cliente_nombre || '').toLowerCase()
        const celular = (t.cliente_celular || '').toLowerCase()
        const codigo = (t.codigo_unico || '').toLowerCase()
        if (!nombre.includes(q) && !celular.includes(q) && !codigo.includes(q)) return false
      }

      if (filtroFechaTipo === 'hoy') {
        if (!t.fecha_hora_inicio) return false
        const fechaTurno = new Date(t.fecha_hora_inicio).toISOString().split('T')[0]
        const hoy = new Date().toISOString().split('T')[0]
        if (fechaTurno !== hoy) return false
      } else if (filtroFechaTipo === 'especifica' && fechaEspecifica) {
        if (!t.fecha_hora_inicio) return false
        const fechaTurno = new Date(t.fecha_hora_inicio).toISOString().split('T')[0]
        if (fechaTurno !== fechaEspecifica) return false
      }

      return true
    })
  }, [turnos, busqueda, filtroFechaTipo, fechaEspecifica])

  const esFechaAgendaPasada = useMemo(() => {
    if (filtroFechaTipo !== 'especifica' || !fechaEspecifica) return false
    const hoy = new Date().toISOString().split('T')[0]
    return fechaEspecifica < hoy
  }, [filtroFechaTipo, fechaEspecifica])

  // --- ACCIONES DE SERVICIOS / ZONAS (LASER) ---
  const abrirModalServicio = (serv?: ServicioLaser) => {
    if (serv) {
      setServicioEdit({ ...serv })
    } else {
      setServicioEdit({
        genero: 'femenino',
        nombre_zona: '',
        categoria_zona: 'Cuerpo',
        precio_lista: 0,
        duracion_minutos: 15,
        activo: true
      })
    }
    setModalServicio(true)
  }

  const guardarServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!servicioEdit) return

    if (servicioEdit.id) {
      // Editar
      const { error } = await supabase
        .from('servicios_laser')
        .update({
          genero: servicioEdit.genero,
          nombre_zona: servicioEdit.nombre_zona,
          categoria_zona: servicioEdit.categoria_zona,
          precio_lista: Number(servicioEdit.precio_lista),
          duracion_minutos: Number(servicioEdit.duracion_minutos),
          activo: servicioEdit.activo
        })
        .eq('id', servicioEdit.id)

      if (error) alert('Error al actualizar: ' + error.message)
    } else {
      // Crear nuevo
      const { error } = await supabase
        .from('servicios_laser')
        .insert([{
          genero: servicioEdit.genero,
          nombre_zona: servicioEdit.nombre_zona,
          categoria_zona: servicioEdit.categoria_zona,
          precio_lista: Number(servicioEdit.precio_lista),
          duracion_minutos: Number(servicioEdit.duracion_minutos),
          activo: servicioEdit.activo ?? true
        }])

      if (error) alert('Error al crear zona: ' + error.message)
    }

    setModalServicio(false)
    fetchPreciosYPromos()
  }

  const toggleActivoServicio = async (serv: ServicioLaser) => {
    const nuevoEstado = !serv.activo
    const { error } = await supabase
      .from('servicios_laser')
      .update({ activo: nuevoEstado })
      .eq('id', serv.id)

    if (!error) {
      setServicios((prev) =>
        prev.map((s) => (s.id === serv.id ? { ...s, activo: nuevoEstado } : s))
      )
    } else {
      alert('Error al actualizar servicio: ' + error.message)
    }
  }

  const eliminarServicio = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta zona permanentemente?')) return

    const { error } = await supabase
      .from('servicios_laser')
      .delete()
      .eq('id', id)

    if (!error) {
      setServicios((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert('Error al eliminar servicio: ' + error.message)
    }
  }

  const eliminarPromo = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta promoción permanentemente?')) return

    const { error } = await supabase
      .from('promos_laser')
      .delete()
      .eq('id', id)

    if (!error) {
      setPromos((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert('Error al eliminar promoción: ' + error.message)
    }
  }

  // --- ACCIONES DE PROMOS ---
  const abrirModalPromo = (promo?: PromoLaser) => {
    if (promo) {
      setPromoEdit({
        ...promo,
        zonas_incluidas: promo.zonas_incluidas || []
      })
    } else {
      setPromoEdit({
        genero: 'femenino',
        nombre_promo: '',
        zonas_incluidas: [],
        precio_promo: 0,
        duracion_total_min: 30,
        permite_swap: false,
        activo: true
      })
    }
    setModalPromo(true)
  }

  const toggleZonaEnPromo = (zonaId: string) => {
    if (!promoEdit) return
    const actuales = promoEdit.zonas_incluidas || []
    const existe = actuales.includes(zonaId)

    let nuevas: string[]
    if (existe) {
      nuevas = actuales.filter((id) => id !== zonaId)
    } else {
      nuevas = [...actuales, zonaId]
    }

    setPromoEdit({ ...promoEdit, zonas_incluidas: nuevas })
  }

  const guardarPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoEdit) return

    if (promoEdit.id) {
      // Editar
      const { error } = await supabase
        .from('promos_laser')
        .update({
          genero: promoEdit.genero,
          nombre_promo: promoEdit.nombre_promo,
          zonas_incluidas: promoEdit.zonas_incluidas,
          precio_promo: Number(promoEdit.precio_promo),
          duracion_total_min: Number(promoEdit.duracion_total_min),
          permite_swap: promoEdit.permite_swap,
          activo: promoEdit.activo
        })
        .eq('id', promoEdit.id)

      if (error) alert('Error al actualizar promo: ' + error.message)
    } else {
      // Crear
      const { error } = await supabase
        .from('promos_laser')
        .insert([{
          genero: promoEdit.genero,
          nombre_promo: promoEdit.nombre_promo,
          zonas_incluidas: promoEdit.zonas_incluidas,
          precio_promo: Number(promoEdit.precio_promo),
          duracion_total_min: Number(promoEdit.duracion_total_min),
          permite_swap: promoEdit.permite_swap ?? false,
          activo: promoEdit.activo ?? true
        }])

      if (error) alert('Error al crear promo: ' + error.message)
    }

    setModalPromo(false)
    fetchPreciosYPromos()
  }

  const toggleActivoPromo = async (promo: PromoLaser) => {
    const nuevoEstado = !promo.activo
    const { error } = await supabase
      .from('promos_laser')
      .update({ activo: nuevoEstado })
      .eq('id', promo.id)

    if (!error) {
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, activo: nuevoEstado } : p))
      )
    } else {
      alert('Error al actualizar promoción: ' + error.message)
    }
  }

  // --- ACCIONES DE SERVICIOS GENERALES ---
  const abrirModalGeneral = (serv?: ServicioGeneral) => {
    if (serv) {
      setServicioGeneralEdit({ ...serv })
    } else {
      setServicioGeneralEdit({
        categoria: '',
        subtipo: '',
        precio: 0,
        duracion_minutos: 30,
        activo: true
      })
    }
    setModalGeneral(true)
  }

  const guardarServicioGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!servicioGeneralEdit) return

    const payload = {
      categoria: servicioGeneralEdit.categoria,
      subtipo: servicioGeneralEdit.subtipo,
      precio: Number(servicioGeneralEdit.precio),
      duracion_minutos: Number(servicioGeneralEdit.duracion_minutos),
      activo: servicioGeneralEdit.activo ?? true
    }

    if (servicioGeneralEdit.id) {
      // Editar
      const { error } = await supabase
        .from('servicios_generales')
        .update(payload)
        .eq('id', servicioGeneralEdit.id)

      if (error) {
        alert('Error al actualizar el servicio: ' + error.message)
        return
      }
    } else {
      // Crear
      const { error } = await supabase
        .from('servicios_generales')
        .insert([payload])

      if (error) {
        alert('Error al crear el servicio: ' + error.message)
        return
      }
    }

    setModalGeneral(false)
    setServicioGeneralEdit(null)
    fetchServiciosGenerales()
  }

  const toggleActivoGeneral = async (serv: ServicioGeneral) => {
    const nuevoEstado = !serv.activo
    const { error } = await supabase
      .from('servicios_generales')
      .update({ activo: nuevoEstado })
      .eq('id', serv.id)

    if (!error) {
      setServiciosGenerales((prev) =>
        prev.map((s) => (s.id === serv.id ? { ...s, activo: nuevoEstado } : s))
      )
    } else {
      alert('Error al actualizar el estado: ' + error.message)
    }
  }

  const eliminarServicioGeneral = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este servicio permanentemente?')) return

    const { error } = await supabase
      .from('servicios_generales')
      .delete()
      .eq('id', id)

    if (!error) {
      setServiciosGenerales((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert('Error al eliminar el servicio: ' + error.message)
    }
  }

  // --- ACCIONES DE CONFIGURACIÓN DE CALENDARIO / HORARIOS ---

  // Láser: rango horario general
  const actualizarRangoLaser = (campo: 'inicio' | 'fin', valor: string) => {
    setConfigLaser((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [campo]: valor
      }
    }))
  }

  // Láser: fechas habilitadas
  const agregarFechaLaser = () => {
    if (!nuevaFechaLaser) return
    setConfigLaser((prev) => {
      const actuales = prev.fechas_habilitadas_laser || []
      if (actuales.includes(nuevaFechaLaser)) return prev
      return {
        ...prev,
        fechas_habilitadas_laser: [...actuales, nuevaFechaLaser].sort()
      }
    })
    setNuevaFechaLaser('')
  }

  const quitarFechaLaser = (fecha: string) => {
    setConfigLaser((prev) => ({
      ...prev,
      fechas_habilitadas_laser: (prev.fechas_habilitadas_laser || []).filter((f) => f !== fecha)
    }))
  }

  const guardarConfigLaser = async () => {
    setGuardandoLaser(true)

    // Limpiamos las fechas para asegurar formato YYYY-MM-DD sin horas
    const fechasLimpias = (configLaser.fechas_habilitadas_laser || []).map(
      (f: string) => String(f).slice(0, 10)
    )

    const payload = {
      tipo_servicio: 'laser' as const,
      horarios_atencion: {
        inicio: configLaser.horarios_atencion?.inicio || '09:00',
        fin: configLaser.horarios_atencion?.fin || '18:00',
        dias_semana: [1, 2, 3, 4, 5, 6, 7], // Habilita el calendario para que se puedan elegir las fechas
        intervalo_minutos: configLaser.horarios_atencion?.intervalo_minutos || 30
      },
      fechas_habilitadas_laser: fechasLimpias,
      updated_at: new Date().toISOString()
    }

    if (configLaser.id) {
      const { error } = await supabase
        .from('configuracion_calendario')
        .update(payload)
        .eq('id', configLaser.id)

      if (error) {
        alert('Error al guardar la configuración de láser: ' + error.message)
        setGuardandoLaser(false)
        return
      }
    } else {
      const { data, error } = await supabase
        .from('configuracion_calendario')
        .insert([payload])
        .select()
        .single()

      if (error) {
        alert('Error al crear la configuración de láser: ' + error.message)
        setGuardandoLaser(false)
        return
      }
      if (data) setConfigLaser((prev) => ({ ...prev, id: (data as any).id }))
    }

    alert('Horarios y fechas de Depilación Láser guardados correctamente.')
    setGuardandoLaser(false)
  }

  // General: días y horarios
  const toggleDiaGeneral = (dia: keyof HorariosSemana) => {
    setConfigGeneral((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [dia]: {
          ...prev.horarios_atencion[dia],
          abierto: !prev.horarios_atencion[dia].abierto
        }
      }
    }))
  }

  const actualizarHorarioGeneral = (dia: keyof HorariosSemana, campo: 'inicio' | 'fin', valor: string) => {
    setConfigGeneral((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [dia]: {
          ...prev.horarios_atencion[dia],
          [campo]: valor
        }
      }
    }))
  }

  // General: días de excepción / bloqueados
  const agregarExcepcionGeneral = () => {
    if (!nuevaExcepcionGeneral) return
    setConfigGeneral((prev) => {
      const actuales: string[] = prev.horarios_atencion?.excepciones || []
      if (actuales.includes(nuevaExcepcionGeneral)) return prev
      return {
        ...prev,
        horarios_atencion: {
          ...prev.horarios_atencion,
          excepciones: [...actuales, nuevaExcepcionGeneral].sort()
        }
      }
    })
    setNuevaExcepcionGeneral('')
  }

  const quitarExcepcionGeneral = (fecha: string) => {
    setConfigGeneral((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        excepciones: (prev.horarios_atencion?.excepciones || []).filter((f: string) => f !== fecha)
      }
    }))
  }

const guardarConfigGeneral = async () => {
    setGuardandoGeneral(true)

    // Calculamos los bloques globales a partir del horario (tomando de referencia el primer día activo)
    // o extrayendo el inicio/fin para que el cliente continúe leyendo el array "bloques".
    const horarios = configGeneral.horarios_atencion || {};
    
    // Generamos un bloque general basado en los rangos activos
    const bloquesCalculados = [
      { inicio: '09:00', fin: '13:00' },
      { inicio: '14:00', fin: '19:00' }
    ];

    const payload = {
      tipo_servicio: 'general' as const,
      horarios_atencion: {
        ...horarios,
        // Conservamos o recalculamos los bloques para que la app del cliente no se rompa
        bloques: horarios.bloques || bloquesCalculados
      },
      updated_at: new Date().toISOString()
    }

    if (configGeneral.id) {
      const { error } = await supabase
        .from('configuracion_calendario')
        .update(payload)
        .eq('id', configGeneral.id)

      if (error) {
        alert('Error al guardar los horarios generales: ' + error.message)
        setGuardandoGeneral(false)
        return
      }
    } else {
      const { data, error } = await supabase
        .from('configuracion_calendario')
        .insert([payload])
        .select()
        .single()

      if (error) {
        alert('Error al crear los horarios generales: ' + error.message)
        setGuardandoGeneral(false)
        return
      }
      if (data) setConfigGeneral((prev) => ({ ...prev, id: (data as any).id }))
    }

    alert('Horarios Generales guardados correctamente.')
    setGuardandoGeneral(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // --- HELPERS DE RENDER ---
  const renderDetalle = (item: Reserva) => {
    if (!item.detalle_reserva) return item.servicio_tipo || '-'

    let detalle = item.detalle_reserva
    if (typeof detalle === 'string') {
      try { detalle = JSON.parse(detalle) } catch (e) { return detalle }
    }

    if (detalle?.detalle_texto) return detalle.detalle_texto
    if (Array.isArray(detalle)) return detalle.join(', ')
    if (typeof detalle === 'object') {
      if (detalle.zonas) return Array.isArray(detalle.zonas) ? detalle.zonas.join(', ') : String(detalle.zonas)
      if (detalle.promo) return String(detalle.promo)
      if (detalle.nombre) return String(detalle.nombre)
    }

    return item.servicio_tipo || 'Reserva'
  }

  const renderFechaHora = (fechaIso?: string) => {
    if (!fechaIso) return 'Sin fecha'
    const fechaObj = new Date(fechaIso)

    const fecha = fechaObj.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })

    const hora = fechaObj.toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit'
    })

    return `${fecha} - ${hora} hs`
  }

  const getNombresZonas = (idsZonas?: string[]) => {
    if (!idsZonas || idsZonas.length === 0) return 'Ninguna zona asignada'
    const nombres = idsZonas
      .map((id) => servicios.find((s) => s.id === id)?.nombre_zona)
      .filter(Boolean)
    return nombres.length > 0 ? nombres.join(' + ') : 'Zonas no encontradas'
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  // Filtrado de reservas
  const turnosFiltrados = turnos.filter((t) => {
    if (filtroEstado !== 'todos' && (t.estado || 'pendiente') !== filtroEstado) return false
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase()
      const nombre = (t.cliente_nombre || '').toLowerCase()
      const celular = (t.cliente_celular || '').toLowerCase()
      const codigo = (t.codigo_unico || '').toLowerCase()
      if (!nombre.includes(q) && !celular.includes(q) && !codigo.includes(q)) return false
    }

    if (filtroFechaTipo === 'hoy') {
      if (!t.fecha_hora_inicio) return false
      const fechaTurno = new Date(t.fecha_hora_inicio).toISOString().split('T')[0]
      const hoy = new Date().toISOString().split('T')[0]
      if (fechaTurno !== hoy) return false
    } else if (filtroFechaTipo === 'especifica' && fechaEspecifica) {
      if (!t.fecha_hora_inicio) return false
      const fechaTurno = new Date(t.fecha_hora_inicio).toISOString().split('T')[0]
      if (fechaTurno !== fechaEspecifica) return false
    }

    return true
  })

  // Métricas
  const totalReservas = turnos.length
  const ingresosCobrados = turnos
    .filter((t) => t.estado === 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  const ingresosPendientes = turnos
    .filter((t) => t.estado !== 'cancelado' && t.estado !== 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Panel de Control</h1>
          <p className="text-xs text-gray-500">Gestión de Turnos y Estética</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'agenda'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Agenda de Turnos ({turnos.length})
          </button>
          <button
            onClick={() => setActiveTab('precios')}
            className={`pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'precios'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
          Editor Depilacion (Láser)
          </button>
          <button
            onClick={() => setActiveTab('generales')}
            className={`pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'generales'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Editor Servicios Generales ({serviciosGenerales.length})
          </button>
          <button
            onClick={() => setActiveTab('horarios')}
            className={`pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === 'horarios'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Editar Horarios
          </button>
        </div>

        {/* 1. RESUMEN GENERAL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">Total Reservas Creadas</span>
              <p className="text-3xl font-extrabold mt-2">{totalReservas}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">Recaudación Real (Completados)</span>
              <p className="text-3xl font-extrabold mt-2 text-emerald-600">
                ${ingresosCobrados.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">Pendiente de Cobro / Estimado</span>
              <p className="text-3xl font-extrabold mt-2 text-blue-600">
                ${ingresosPendientes.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        )}

        {/* 2. AGENDA */}
        {activeTab === 'agenda' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
              <input
                type="text"
                placeholder="Buscar cliente, tel o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none w-full md:w-64 focus:border-black transition"
              />
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filtroFechaTipo}
                  onChange={(e) => setFiltroFechaTipo(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
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
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none"
                  />
                  
                )}
                
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Pendiente_sena">Pendiente Seña</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                <button
                  onClick={abrirModalNuevoTurno}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  + Nuevo Turno
                </button>
              </div>
            </div>

{/* AQUÍ VA EL NUEVO COMPONENTE */}
          <ResumenAgenda 
            turnos={turnosAgendaResumen} 
            esFechaPasada={esFechaAgendaPasada} 
          />
          
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando turnos...</div>
            ) : turnosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No se encontraron reservas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Código</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Fecha y Hora</th>
                      <th className="px-6 py-3">Detalle / Zonas</th>
                      <th className="px-6 py-3">Monto</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {turnosFiltrados.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                          {t.codigo_unico || '-'}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <div>{t.cliente_nombre || 'Sin nombre'}</div>
                          {t.cliente_celular && (
                            <div className="text-xs text-gray-500">{t.cliente_celular}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-700">
                          {renderFechaHora(t.fecha_hora_inicio)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {renderDetalle(t)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          ${(Number(t.precio_total) || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4">
  <div className="flex flex-col items-start gap-1">
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        t.estado === 'confirmado'
          ? 'bg-blue-100 text-blue-700'
          : t.estado === 'completado'
          ? 'bg-green-100 text-green-700'
          : t.estado === 'cancelado'
          ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {t.estado || 'pendiente'}
    </span>

    {/* ETIQUETA VISUAL DEL MEDIO DE PAGO */}
    {t.estado === 'completado' && t.medio_pago && (
      <span className="text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded capitalize">
        💳 {t.medio_pago}
      </span>
    )}
  </div>
</td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
  <button
    onClick={() => abrirModalEditarTurno(t)}
    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 font-medium"
  >
    Editar
  </button>
  {t.estado !== 'confirmado' && t.estado !== 'completado' && (
    <button
      onClick={() => actualizarEstado(t.id, 'confirmado')}
      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
    >
      Confirmar
    </button>
  )}
  {t.estado !== 'completado' && (
    <button
      onClick={() => actualizarEstado(t.id, 'completado')}
      className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
    >
      Completar
    </button>
  )}
  {t.estado !== 'cancelado' && (
    <button
      onClick={() => actualizarEstado(t.id, 'cancelado')}
      className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100"
    >
      Cancelar
    </button>
  )}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. PRECIOS Y SERVICIOS (LASER) */}
        {activeTab === 'precios' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => setSeccionPrecios('servicios')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    seccionPrecios === 'servicios'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Zonas / Servicios Laser ({servicios.length})
                </button>
                <button
                  onClick={() => setSeccionPrecios('promos')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    seccionPrecios === 'promos'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Promociones ({promos.length})
                </button>
              </div>

              {seccionPrecios === 'servicios' ? (
                <button
                  onClick={() => abrirModalServicio()}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  + Nueva Zona
                </button>
              ) : (
                <button
                  onClick={() => abrirModalPromo()}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  + Nueva Promo
                </button>
              )}
            </div>

            {loadingPrecios ? (
              <div className="py-8 text-center text-gray-500">Cargando precios...</div>
            ) : seccionPrecios === 'servicios' ? (
              /* TABLA ZONAS / SERVICIOS */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Zona</th>
                      <th className="px-4 py-3">Género</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Duración (min)</th>
                      <th className="px-4 py-3">Precio Lista ($)</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {servicios.map((serv) => (
                      <tr key={serv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{serv.nombre_zona || '-'}</td>
                        <td className="px-4 py-3 text-xs">
  <span className={`px-2.5 py-1 rounded-full font-medium capitalize ${
    serv.genero?.toLowerCase() === 'masculino'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-pink-100 text-pink-700'
  }`}>
    {serv.genero || '-'}
  </span>
</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{serv.categoria_zona || '-'}</td>
                        <td className="px-4 py-3 text-xs">{serv.duracion_minutos || 0} min</td>
                        <td className="px-4 py-3 font-semibold">
                          ${(serv.precio_lista || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActivoServicio(serv)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              serv.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {serv.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => abrirModalServicio(serv)}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarServicio(serv.id)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABLA PROMOCIONES */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Promoción</th>
                      <th className="px-4 py-3">Género</th>
                      <th className="px-4 py-3">Zonas Incluidas</th>
                      <th className="px-4 py-3">Duración</th>
                      <th className="px-4 py-3">Precio Promo ($)</th>
                      <th className="px-4 py-3">Swap</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {promos.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.nombre_promo || '-'}</td>
                        <td className="px-4 py-3 text-xs capitalize text-gray-500">{p.genero || '-'}</td>
                        <td className="px-4 py-3 text-xs max-w-xs">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                            {getNombresZonas(p.zonas_incluidas)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{p.duracion_total_min || 0} min</td>
                        <td className="px-4 py-3 font-semibold">
                          ${(p.precio_promo || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium">
                          {p.permite_swap ? 'Sí' : 'No'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActivoPromo(p)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              p.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {p.activo ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => abrirModalPromo(p)}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarPromo(p.id)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. SERVICIOS GENERALES */}
        {activeTab === 'generales' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold">Servicios Generales</h2>
                <p className="text-xs text-gray-500">Gestión de categorías, subtipos, precios y duración</p>
              </div>
              <button
                onClick={() => abrirModalGeneral()}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
              >
                + Nuevo Servicio
              </button>
            </div>

            {loadingGenerales ? (
              <div className="py-8 text-center text-gray-500">Cargando servicios...</div>
            ) : serviciosGenerales.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No hay servicios cargados todavía.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Subtipo</th>
                      <th className="px-4 py-3">Duración (min)</th>
                      <th className="px-4 py-3">Precio ($)</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {serviciosGenerales.map((serv) => (
                      <tr key={serv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{serv.categoria || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{serv.subtipo || '-'}</td>
                        <td className="px-4 py-3 text-xs">{serv.duracion_minutos ?? 0} min</td>
                        <td className="px-4 py-3 font-semibold">
                          ${(serv.precio || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActivoGeneral(serv)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              serv.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {serv.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => abrirModalGeneral(serv)}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarServicioGeneral(serv.id)}
                            className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. EDITAR HORARIOS (CONFIGURACIÓN DE CALENDARIO) */}
        {activeTab === 'horarios' && (
          <div className="space-y-6 pb-10">
            {loadingHorarios ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Cargando configuración de horarios...
              </div>
            ) : (
              <>
                {/* DEPILACIÓN LÁSER */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold">Depilación Láser</h2>
                      <p className="text-xs text-gray-500">
                        Fechas puntuales habilitadas para turnos y rango horario de atención
                      </p>
                    </div>
                    <button
                      onClick={guardarConfigLaser}
                      disabled={guardandoLaser}
                      className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {guardandoLaser ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rango horario laser */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Rango Horario de Atención
                      </label>
                      <div className="flex items-end gap-3">
                        <div>
                          <span className="block text-[11px] text-gray-500 mb-1">Desde</span>
                          <input
                            type="time"
                            value={configLaser.horarios_atencion?.inicio || '09:00'}
                            onChange={(e) => actualizarRangoLaser('inicio', e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                          />
                        </div>
                        <span className="text-gray-400 pb-2">—</span>
                        <div>
                          <span className="block text-[11px] text-gray-500 mb-1">Hasta</span>
                          <input
                            type="time"
                            value={configLaser.horarios_atencion?.fin || '18:00'}
                            onChange={(e) => actualizarRangoLaser('fin', e.target.value)}
                            className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-3">
                        Este rango aplica a todas las fechas habilitadas para láser. Las duraciones de cada turno
                        se calculan automáticamente según las zonas o promos elegidas por el cliente.
                      </p>
                    </div>

                    {/* Fechas habilitadas laser */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Fechas Habilitadas para Turnos
                      </label>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="date"
                          value={nuevaFechaLaser}
                          onChange={(e) => setNuevaFechaLaser(e.target.value)}
                          className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black flex-1"
                        />
                        <button
                          onClick={agregarFechaLaser}
                          className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {(configLaser.fechas_habilitadas_laser || []).length === 0 ? (
                          <div className="p-3 text-xs text-gray-400 text-center">
                            No hay fechas habilitadas todavía.
                          </div>
                        ) : (
                          (configLaser.fechas_habilitadas_laser || []).map((fecha) => (
                            <div key={fecha} className="flex items-center justify-between px-3 py-2 text-xs">
                              <span className="capitalize">{formatFecha(fecha)}</span>
                              <button
                                onClick={() => quitarFechaLaser(fecha)}
                                className="text-red-500 hover:text-red-700 font-medium"
                              >
                                Quitar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SERVICIOS GENERALES */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-bold">Servicios Generales</h2>
                      <p className="text-xs text-gray-500">
                        Horario semanal de apertura y días de excepción (feriados / vacaciones)
                      </p>
                    </div>
                    <button
                      onClick={guardarConfigGeneral}
                      disabled={guardandoGeneral}
                      className="px-4 py-2 text-sm bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {guardandoGeneral ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>

                  {/* Tabla de días de la semana */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3">Día</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3">Desde</th>
                          <th className="px-4 py-3">Hasta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {DIAS_SEMANA.map(({ key, label }) => {
                          const horario: HorarioDia =
                            configGeneral.horarios_atencion?.[key] || horarioDiaDefault()
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{label}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleDiaGeneral(key)}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    horario.abierto
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {horario.abierto ? 'Abierto' : 'Cerrado'}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="time"
                                  disabled={!horario.abierto}
                                  value={horario.inicio}
                                  onChange={(e) => actualizarHorarioGeneral(key, 'inicio', e.target.value)}
                                  className="border border-gray-300 rounded-lg p-1.5 text-xs outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="time"
                                  disabled={!horario.abierto}
                                  value={horario.fin}
                                  onChange={(e) => actualizarHorarioGeneral(key, 'fin', e.target.value)}
                                  className="border border-gray-300 rounded-lg p-1.5 text-xs outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-300"
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Días de excepción / bloqueados */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Días de Excepción / Bloqueados (feriados, vacaciones, etc.)
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="date"
                        value={nuevaExcepcionGeneral}
                        onChange={(e) => setNuevaExcepcionGeneral(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                      />
                      <button
                        onClick={agregarExcepcionGeneral}
                        className="px-3 py-2 text-xs bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700"
                      >
                        + Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(configGeneral.horarios_atencion?.excepciones || []).length === 0 ? (
                        <span className="text-xs text-gray-400">No hay días de excepción cargados.</span>
                      ) : (
                        (configGeneral.horarios_atencion?.excepciones || []).map((fecha: string) => (
                          <span
                            key={fecha}
                            className="flex items-center gap-2 bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full"
                          >
                            {new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                              day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                            <button
                              onClick={() => quitarExcepcionGeneral(fecha)}
                              className="text-red-400 hover:text-red-600 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL ZONAS / SERVICIOS (LASER) */}
      {modalServicio && servicioEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {servicioEdit.id ? 'Editar Zona' : 'Nueva Zona'}
            </h2>
            <form onSubmit={guardarServicio} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Zona</label>
                <input
                  type="text"
                  required
                  value={servicioEdit.nombre_zona || ''}
                  onChange={(e) => setServicioEdit({ ...servicioEdit, nombre_zona: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
                  <select
                    value={servicioEdit.genero || 'femenino'}
                    onChange={(e) => setServicioEdit({ ...servicioEdit, genero: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={servicioEdit.categoria_zona || ''}
                    onChange={(e) => setServicioEdit({ ...servicioEdit, categoria_zona: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio Lista ($)</label>
                  <input
                    type="number"
                    required
                    value={servicioEdit.precio_lista || 0}
                    onChange={(e) => setServicioEdit({ ...servicioEdit, precio_lista: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    value={servicioEdit.duracion_minutos || 0}
                    onChange={(e) => setServicioEdit({ ...servicioEdit, duracion_minutos: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="servicioActivo"
                  checked={servicioEdit.activo ?? true}
                  onChange={(e) => setServicioEdit({ ...servicioEdit, activo: e.target.checked })}
                />
                <label htmlFor="servicioActivo" className="text-sm font-medium">Zona Activa (visible en reservas)</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalServicio(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROMOCIONES */}
      {modalPromo && promoEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {promoEdit.id ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            <form onSubmit={guardarPromo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Promoción</label>
                <input
                  type="text"
                  required
                  value={promoEdit.nombre_promo || ''}
                  onChange={(e) => setPromoEdit({ ...promoEdit, nombre_promo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
                  <select
                    value={promoEdit.genero || 'femenino'}
                    onChange={(e) => setPromoEdit({ ...promoEdit, genero: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio Promo ($)</label>
                  <input
                    type="number"
                    required
                    value={promoEdit.precio_promo || 0}
                    onChange={(e) => setPromoEdit({ ...promoEdit, precio_promo: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    value={promoEdit.duracion_total_min || 0}
                    onChange={(e) => setPromoEdit({ ...promoEdit, duracion_total_min: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* SELECCIÓN DE ZONAS QUE ENTRAN EN LA PROMO */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Zonas Incluidas en la Promo
                </label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {servicios.map((s) => {
                    const estaSeleccionada = (promoEdit.zonas_incluidas || []).includes(s.id)
                    return (
                      <label key={s.id} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={estaSeleccionada}
                          onChange={() => toggleZonaEnPromo(s.id)}
                        />
                        <span className="font-medium text-gray-800">{s.nombre_zona}</span>
                        <span className="text-gray-400">({s.genero})</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promoSwap"
                    checked={promoEdit.permite_swap ?? false}
                    onChange={(e) => setPromoEdit({ ...promoEdit, permite_swap: e.target.checked })}
                  />
                  <label htmlFor="promoSwap" className="text-xs font-medium">Permite Swap de zonas</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promoActiva"
                    checked={promoEdit.activo ?? true}
                    onChange={(e) => setPromoEdit({ ...promoEdit, activo: e.target.checked })}
                  />
                  <label htmlFor="promoActiva" className="text-xs font-medium">Promo Activa</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalPromo(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SERVICIOS GENERALES */}
      {modalGeneral && servicioGeneralEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {servicioGeneralEdit.id ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <form onSubmit={guardarServicioGeneral} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  value={servicioGeneralEdit.categoria || ''}
                  onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, categoria: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  placeholder="Ej: Masajes"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subtipo
                </label>
                <input
                  type="text"
                  value={servicioGeneralEdit.subtipo || ''}
                  onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, subtipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  placeholder="Ej: Descontracturantes"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Si necesitás varios subtipos en un mismo servicio, separalos por coma (ej: "Relax, Descontracturante").
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={servicioGeneralEdit.precio ?? 0}
                    onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, precio: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={servicioGeneralEdit.duracion_minutos ?? 0}
                    onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, duracion_minutos: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="servicioGeneralActivo"
                  checked={servicioGeneralEdit.activo ?? true}
                  onChange={(e) => setServicioGeneralEdit({ ...servicioGeneralEdit, activo: e.target.checked })}
                />
                <label htmlFor="servicioGeneralActivo" className="text-sm font-medium">
                  Servicio Activo (visible en reservas)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalGeneral(false)
                    setServicioGeneralEdit(null)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE COBRO */}
      {turnoACobrar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Completar y Cobrar Turno
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Cliente: <span className="font-semibold text-gray-800">{turnoACobrar.cliente_nombre}</span>
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Servicio / Detalle:</span>
                <span className="font-medium text-gray-800">{renderDetalle(turnoACobrar)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Monto a cobrar:</span>
                <span className="font-bold text-emerald-600 text-base">
                  ${Number(turnoACobrar.precio_total || 0).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">
                Medio de Pago Utilizado
              </label>
              <select
                value={medioPagoSeleccionado}
                onChange={(e) => setMedioPagoSeleccionado(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="qr">Mercado Pago / QR</option>
                <option value="tarjeta">Tarjeta Débito / Crédito</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTurnoACobrar(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                disabled={guardandoCobro}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCobro}
                disabled={guardandoCobro}
                className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {guardandoCobro ? 'Guardando...' : 'Confirmar Cobro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR RESERVA MANUAL */}
{modalNuevoTurno && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Nuevo Turno Manual</h2>
      <form onSubmit={crearTurnoManual} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Cliente</label>
          <input
            type="text"
            required
            value={nuevoTurno.cliente_nombre}
            onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Celular</label>
          <input
            type="text"
            value={nuevoTurno.cliente_celular}
            onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_celular: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            placeholder="+5493413954355"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y Hora</label>
          <input
            type="datetime-local"
            required
            value={nuevoTurno.fecha_hora_local}
            onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha_hora_local: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
          />
        </div>

        {/* SELECTOR DE TIPO DE TURNO */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Tipo de Turno</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoTurnoNuevo('laser')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                tipoTurnoNuevo === 'laser'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Depilación Láser
            </button>
            <button
              type="button"
              onClick={() => setTipoTurnoNuevo('general')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                tipoTurnoNuevo === 'general'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Servicio General
            </button>
          </div>
        </div>

        {/* SELECCIÓN DINÁMICA SEGÚN TIPO */}
        {tipoTurnoNuevo === 'laser' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-700">Zonas (Láser)</label>
              <select
                value={filtroGeneroLaserNuevo}
                onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none"
              >
                <option value="todos">Todos los géneros</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
              {zonasLaserFiltradas.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-2">
                  No hay zonas activas para este filtro.
                </div>
              ) : (
                zonasLaserFiltradas.map((s) => {
                  const seleccionada = zonasSeleccionadasNuevo.includes(s.id)
                  return (
                    <label
                      key={s.id}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => toggleZonaSeleccionadaNuevo(s.id)}
                        />
                        <span className="font-medium text-gray-800">{s.nombre_zona}</span>
                        <span className="text-gray-400">({s.genero})</span>
                      </span>
                      <span className="text-gray-600 font-medium">
                        ${(s.precio_lista || 0).toLocaleString('es-AR')}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Servicio General</label>
            <select
              value={servicioGeneralSeleccionadoNuevo}
              onChange={(e) => setServicioGeneralSeleccionadoNuevo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            >
              <option value="">Seleccioná un servicio...</option>
              {serviciosGeneralesActivos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.categoria}
                  {s.subtipo ? ` - ${s.subtipo}` : ''} (${(s.precio || 0).toLocaleString('es-AR')})
                </option>
              ))}
            </select>
            {serviciosGeneralesActivos.length === 0 && (
              <p className="text-[11px] text-gray-400 mt-1">No hay servicios generales activos cargados.</p>
            )}
          </div>
        )}

        {/* DETALLE AUTOCOMPLETADO */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Detalle / Zonas</label>
          <textarea
            value={nuevoTurno.detalle_texto}
            onChange={(e) => setNuevoTurno({ ...nuevoTurno, detalle_texto: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            rows={2}
          />
        </div>

        {/* PRECIO Y MÉTODO DE PAGO */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Total ($)</label>
            <input
              type="number"
              required
              min={0}
              value={nuevoTurno.precio_total}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, precio_total: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Método de Pago</label>
            <input
              type="text"
              value={nuevoTurno.metodo_pago}
              onChange={(e) => setNuevoTurno({ ...nuevoTurno, metodo_pago: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
              placeholder="Ej: Efectivo, Transferencia"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado Inicial</label>
          <select
            value={nuevoTurno.estado}
            onChange={(e) => setNuevoTurno({ ...nuevoTurno, estado: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
          >
            <option value="pendiente_sena">Pendiente Seña</option>
            <option value="confirmado">Confirmado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setModalNuevoTurno(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardandoNuevoTurno}
            className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {guardandoNuevoTurno ? 'Guardando...' : 'Crear Turno'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* MODAL: EDITAR RESERVA EXISTENTE */}
{modalEditarTurno && turnoEdit && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Editar Turno</h2>
      <form onSubmit={guardarEdicionTurno} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Cliente</label>
          <input
            type="text"
            required
            value={turnoEdit.cliente_nombre}
            onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_nombre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Celular</label>
          <input
            type="text"
            value={turnoEdit.cliente_celular}
            onChange={(e) => setTurnoEdit({ ...turnoEdit, cliente_celular: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y Hora</label>
          <input
            type="datetime-local"
            required
            value={turnoEdit.fecha_hora_local}
            onChange={(e) => setTurnoEdit({ ...turnoEdit, fecha_hora_local: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Detalle / Zonas</label>
          <textarea
            value={turnoEdit.detalle_texto}
            onChange={(e) => setTurnoEdit({ ...turnoEdit, detalle_texto: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Total ($)</label>
            <input
              type="number"
              required
              min={0}
              value={turnoEdit.precio_total}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, precio_total: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Método de Pago</label>
            <input
              type="text"
              value={turnoEdit.metodo_pago}
              onChange={(e) => setTurnoEdit({ ...turnoEdit, metodo_pago: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={turnoEdit.estado}
            onChange={(e) => setTurnoEdit({ ...turnoEdit, estado: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
          >
            <option value="pendiente_sena">Pendiente Seña</option>
            <option value="confirmado">Confirmado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setModalEditarTurno(false)
              setTurnoEdit(null)
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardandoEdicionTurno}
            className="px-4 py-2 text-sm bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {guardandoEdicionTurno ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  )
}

