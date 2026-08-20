'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import AdminHeader from '@/components/admin/AdminHeader'
import AdminTabs from '@/components/admin/AdminTabs'
import OverviewTab from '@/components/admin/tabs/OverviewTab'
import AgendaTab from '@/components/admin/tabs/AgendaTab'
import PreciosTab from '@/components/admin/tabs/PreciosTab'
import GeneralesTab from '@/components/admin/tabs/GeneralesTab'
import HorariosTab from '@/components/admin/tabs/HorariosTab'

import ModalServicioLaser from '@/components/admin/modals/ModalServicioLaser'
import ModalPromo from '@/components/admin/modals/ModalPromo'
import ModalServicioGeneral from '@/components/admin/modals/ModalServicioGeneral'
import ModalCobro from '@/components/admin/modals/ModalCobro'
import ModalNuevoTurno from '@/components/admin/modals/ModalNuevoTurno'
import ModalEditarTurno from '@/components/admin/modals/ModalEditarTurno'

import {
  Reserva,
  ServicioLaser,
  PromoLaser,
  ServicioGeneral,
  ConfigCalendario,
  HorariosSemana,
  TabKey,
  TurnoForm,
  horariosSemanaDefault,
  turnoFormVacio,
  isoToDatetimeLocal,
  datetimeLocalToIso,
  renderDetalle
} from '@/components/admin/types'

export default function AdminDashboard() {
  const router = useRouter()

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
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
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

  // --- ESTADOS: SELECCIÓN DE SERVICIOS EN "NUEVO TURNO" ---
  const [tipoTurnoNuevo, setTipoTurnoNuevo] = useState<'laser' | 'general'>('laser')
  const [filtroGeneroLaserNuevo, setFiltroGeneroLaserNuevo] = useState<string>('todos')
  const [zonasSeleccionadasNuevo, setZonasSeleccionadasNuevo] = useState<string[]>([])
  const [servicioGeneralSeleccionadoNuevo, setServicioGeneralSeleccionadoNuevo] = useState<string>('')

  const [modalNuevoTurno, setModalNuevoTurno] = useState<boolean>(false)
  const [nuevoTurno, setNuevoTurno] = useState<TurnoForm>(turnoFormVacio())
  const [guardandoNuevoTurno, setGuardandoNuevoTurno] = useState(false)

  const [modalEditarTurno, setModalEditarTurno] = useState<boolean>(false)
  const [turnoEdit, setTurnoEdit] = useState<TurnoForm | null>(null)
  const [guardandoEdicionTurno, setGuardandoEdicionTurno] = useState(false)

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
      setNuevoTurno((prev) => ({ ...prev, precio_total: total, detalle_texto: detalle }))
    } else {
      const serv = serviciosGeneralesActivos.find((s) => s.id === servicioGeneralSeleccionadoNuevo)
      if (serv) {
        const detalle = [serv.categoria, serv.subtipo].filter(Boolean).join(' - ')
        setNuevoTurno((prev) => ({ ...prev, precio_total: Number(serv.precio) || 0, detalle_texto: detalle }))
      } else {
        setNuevoTurno((prev) => ({ ...prev, precio_total: 0, detalle_texto: '' }))
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

  // --- ABRIR MODAL NUEVO TURNO ---
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

    let duracionReal = 30

    if (tipoTurnoNuevo === 'laser') {
      duracionReal = zonasSeleccionadasNuevo.reduce((total, idZona) => {
        const zonaEncontrada = servicios.find(s => s.id === idZona)
        return total + (zonaEncontrada?.duracion_minutos || 0)
      }, 0)
    } else {
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
      duracion_total: duracionReal,
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
    if (nuevoEstado === 'completado') {
      const turno = turnos.find((t) => t.id === id)
      if (turno) {
        setTurnoACobrar(turno)
        setMedioPagoSeleccionado(turno.medio_pago || 'efectivo')
      }
      return
    }

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
      const { error } = await supabase
        .from('servicios_generales')
        .update(payload)
        .eq('id', servicioGeneralEdit.id)

      if (error) {
        alert('Error al actualizar el servicio: ' + error.message)
        return
      }
    } else {
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
  const actualizarRangoLaser = (campo: 'inicio' | 'fin', valor: string) => {
    setConfigLaser((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [campo]: valor
      }
    }))
  }

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

    const fechasLimpias = (configLaser.fechas_habilitadas_laser || []).map(
      (f: string) => String(f).slice(0, 10)
    )

    const payload = {
      tipo_servicio: 'laser' as const,
      horarios_atencion: {
        inicio: configLaser.horarios_atencion?.inicio || '09:00',
        fin: configLaser.horarios_atencion?.fin || '18:00',
        dias_semana: [1, 2, 3, 4, 5, 6, 7],
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

    const horarios = configGeneral.horarios_atencion || {}

    const bloquesCalculados = [
      { inicio: '09:00', fin: '13:00' },
      { inicio: '14:00', fin: '19:00' }
    ]

    const payload = {
      tipo_servicio: 'general' as const,
      horarios_atencion: {
        ...horarios,
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

  // Filtrado de reservas (tabla principal de agenda)
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
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <AdminTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          totalTurnos={turnos.length}
          totalGenerales={serviciosGenerales.length}
        />

        {activeTab === 'overview' && (
          <OverviewTab
            totalReservas={totalReservas}
            ingresosCobrados={ingresosCobrados}
            ingresosPendientes={ingresosPendientes}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab
            loading={loading}
            turnosFiltrados={turnosFiltrados}
            turnosAgendaResumen={turnosAgendaResumen}
            esFechaAgendaPasada={esFechaAgendaPasada}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroFechaTipo={filtroFechaTipo}
            setFiltroFechaTipo={setFiltroFechaTipo}
            fechaEspecifica={fechaEspecifica}
            setFechaEspecifica={setFechaEspecifica}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            onNuevoTurno={abrirModalNuevoTurno}
            onEditarTurno={abrirModalEditarTurno}
            onActualizarEstado={actualizarEstado}
          />
        )}

        {activeTab === 'precios' && (
          <PreciosTab
            loadingPrecios={loadingPrecios}
            servicios={servicios}
            promos={promos}
            seccionPrecios={seccionPrecios}
            setSeccionPrecios={setSeccionPrecios}
            onNuevaZona={() => abrirModalServicio()}
            onEditarZona={(s) => abrirModalServicio(s)}
            onToggleActivoZona={toggleActivoServicio}
            onEliminarZona={eliminarServicio}
            onNuevaPromo={() => abrirModalPromo()}
            onEditarPromo={(p) => abrirModalPromo(p)}
            onToggleActivoPromo={toggleActivoPromo}
            onEliminarPromo={eliminarPromo}
          />
        )}

        {activeTab === 'generales' && (
          <GeneralesTab
            loadingGenerales={loadingGenerales}
            serviciosGenerales={serviciosGenerales}
            onNuevoServicio={() => abrirModalGeneral()}
            onEditarServicio={(s) => abrirModalGeneral(s)}
            onToggleActivo={toggleActivoGeneral}
            onEliminarServicio={eliminarServicioGeneral}
          />
        )}

        {activeTab === 'horarios' && (
          <HorariosTab
            loadingHorarios={loadingHorarios}
            configLaser={configLaser}
            guardandoLaser={guardandoLaser}
            nuevaFechaLaser={nuevaFechaLaser}
            setNuevaFechaLaser={setNuevaFechaLaser}
            onActualizarRangoLaser={actualizarRangoLaser}
            onAgregarFechaLaser={agregarFechaLaser}
            onQuitarFechaLaser={quitarFechaLaser}
            onGuardarConfigLaser={guardarConfigLaser}
            configGeneral={configGeneral}
            guardandoGeneral={guardandoGeneral}
            nuevaExcepcionGeneral={nuevaExcepcionGeneral}
            setNuevaExcepcionGeneral={setNuevaExcepcionGeneral}
            onToggleDiaGeneral={toggleDiaGeneral}
            onActualizarHorarioGeneral={actualizarHorarioGeneral}
            onAgregarExcepcionGeneral={agregarExcepcionGeneral}
            onQuitarExcepcionGeneral={quitarExcepcionGeneral}
            onGuardarConfigGeneral={guardarConfigGeneral}
          />
        )}
      </div>

      {/* MODALES */}
      {modalServicio && servicioEdit && (
        <ModalServicioLaser
          servicioEdit={servicioEdit}
          setServicioEdit={setServicioEdit}
          onSubmit={guardarServicio}
          onClose={() => setModalServicio(false)}
        />
      )}

      {modalPromo && promoEdit && (
        <ModalPromo
          promoEdit={promoEdit}
          setPromoEdit={setPromoEdit}
          servicios={servicios}
          onToggleZona={toggleZonaEnPromo}
          onSubmit={guardarPromo}
          onClose={() => setModalPromo(false)}
        />
      )}

      {modalGeneral && servicioGeneralEdit && (
        <ModalServicioGeneral
          servicioGeneralEdit={servicioGeneralEdit}
          setServicioGeneralEdit={setServicioGeneralEdit}
          onSubmit={guardarServicioGeneral}
          onClose={() => {
            setModalGeneral(false)
            setServicioGeneralEdit(null)
          }}
        />
      )}

      {turnoACobrar && (
        <ModalCobro
          turnoACobrar={turnoACobrar}
          medioPagoSeleccionado={medioPagoSeleccionado}
          setMedioPagoSeleccionado={setMedioPagoSeleccionado}
          guardandoCobro={guardandoCobro}
          onConfirm={confirmarCobro}
          onClose={() => setTurnoACobrar(null)}
        />
      )}

      {modalNuevoTurno && (
        <ModalNuevoTurno
          nuevoTurno={nuevoTurno}
          setNuevoTurno={setNuevoTurno}
          tipoTurnoNuevo={tipoTurnoNuevo}
          setTipoTurnoNuevo={setTipoTurnoNuevo}
          filtroGeneroLaserNuevo={filtroGeneroLaserNuevo}
          setFiltroGeneroLaserNuevo={setFiltroGeneroLaserNuevo}
          zonasSeleccionadasNuevo={zonasSeleccionadasNuevo}
          toggleZonaSeleccionadaNuevo={toggleZonaSeleccionadaNuevo}
          zonasLaserFiltradas={zonasLaserFiltradas}
          servicioGeneralSeleccionadoNuevo={servicioGeneralSeleccionadoNuevo}
          setServicioGeneralSeleccionadoNuevo={setServicioGeneralSeleccionadoNuevo}
          serviciosGeneralesActivos={serviciosGeneralesActivos}
          guardandoNuevoTurno={guardandoNuevoTurno}
          onSubmit={crearTurnoManual}
          onClose={() => setModalNuevoTurno(false)}
        />
      )}

      {modalEditarTurno && turnoEdit && (
        <ModalEditarTurno
          turnoEdit={turnoEdit}
          setTurnoEdit={setTurnoEdit}
          guardandoEdicionTurno={guardandoEdicionTurno}
          onSubmit={guardarEdicionTurno}
          onClose={() => {
            setModalEditarTurno(false)
            setTurnoEdit(null)
          }}
        />
      )}
    </div>
  )
}