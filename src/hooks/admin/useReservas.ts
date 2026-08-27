'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Reserva,
  ServicioLaser,
  ServicioGeneral,
  TurnoForm,
  turnoFormVacio,
  isoToDatetimeLocal,
  datetimeLocalToIso,
  renderDetalle
} from '@/components/admin/types'

export function useReservas() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  // Catálogo de solo lectura (necesario para calcular precio/duración del turno nuevo)
  const [servicios, setServicios] = useState<ServicioLaser[]>([])
  const [serviciosGenerales, setServiciosGenerales] = useState<ServicioGeneral[]>([])

  // Filtros de Agenda
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [filtroFechaTipo, setFiltroFechaTipo] = useState<'todos' | 'hoy' | 'especifica'>('todos')
  const [fechaEspecifica, setFechaEspecifica] = useState<string>('')

  // Modal de Registro de Cobro
  const [turnoACobrar, setTurnoACobrar] = useState<Reserva | null>(null)
  const [medioPagoSeleccionado, setMedioPagoSeleccionado] = useState<string>('efectivo')
  const [guardandoCobro, setGuardandoCobro] = useState(false)

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

    if (!error && data) setTurnos(data as Reserva[])
    setLoading(false)
  }

  // Solo lectura: usado para armar el selector de zonas/servicios del turno nuevo
  const fetchCatalogoLectura = async () => {
    const { data: servData } = await supabase
      .from('servicios_laser')
      .select('*')
      .order('nombre_zona', { ascending: true })

    const { data: genData } = await supabase
      .from('servicios_generales')
      .select('*')
      .order('categoria', { ascending: true })

    if (servData) setServicios(servData as ServicioLaser[])
    if (genData) setServiciosGenerales(genData as ServicioGeneral[])
  }

  useEffect(() => {
    fetchTurnos()
    fetchCatalogoLectura()
  }, [])

  const serviciosLaserActivos = useMemo(() => servicios.filter((s) => s.activo), [servicios])
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

  // --- ABRIR MODALES ---
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
        try {
          detalle = JSON.parse(detalle)
        } catch {
          detalle = { detalle_texto: detalle }
        }
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
        const zonaEncontrada = servicios.find((s) => s.id === idZona)
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

    const { data, error } = await supabase.from('reservas').insert([payload]).select().single()

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

    const { error } = await supabase.from('reservas').update(payload).eq('id', turnoEdit.id)

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
      setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t)))
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

  // Filtrado de reservas (tabla principal de agenda)
  const turnosFiltrados = turnos.filter((t) => {
    if (filtroEstado !== 'todos' && (t.estado || 'pendiente') !== filtroEstado) return false
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase()
      const nombre = (t.cliente_nombre || '').toLowerCase()
      const celular = (t.cliente_celular || '').toLowerCase()
      const codigo = (t.codigo_unico || '').toLowerCase()
      const referido = (t.codigo_referido_usado || '').toLowerCase()
      if (!nombre.includes(q) && !celular.includes(q) && !codigo.includes(q) && !referido.includes(q)) {
        return false
      }
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

  // Resumen de agenda (mismo criterio de fecha/búsqueda, sin filtro de estado)
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

  // Métricas (Overview)
  const totalReservas = turnos.length
  const ingresosCobrados = turnos
    .filter((t) => t.estado === 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)
  const ingresosPendientes = turnos
    .filter((t) => t.estado !== 'cancelado' && t.estado !== 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  return {
    // datos base
    turnos,
    loading,

    // filtros agenda
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    filtroFechaTipo,
    setFiltroFechaTipo,
    fechaEspecifica,
    setFechaEspecifica,

    // cobro
    turnoACobrar,
    setTurnoACobrar,
    medioPagoSeleccionado,
    setMedioPagoSeleccionado,
    guardandoCobro,
    confirmarCobro,

    // builder de turno nuevo
    tipoTurnoNuevo,
    setTipoTurnoNuevo,
    filtroGeneroLaserNuevo,
    setFiltroGeneroLaserNuevo,
    zonasSeleccionadasNuevo,
    toggleZonaSeleccionadaNuevo,
    servicioGeneralSeleccionadoNuevo,
    setServicioGeneralSeleccionadoNuevo,
    zonasLaserFiltradas,
    serviciosGeneralesActivos,

    modalNuevoTurno,
    setModalNuevoTurno,
    nuevoTurno,
    setNuevoTurno,
    guardandoNuevoTurno,

    modalEditarTurno,
    setModalEditarTurno,
    turnoEdit,
    setTurnoEdit,
    guardandoEdicionTurno,

    // acciones
    abrirModalNuevoTurno,
    abrirModalEditarTurno,
    crearTurnoManual,
    guardarEdicionTurno,
    actualizarEstado,

    // listas derivadas
    turnosFiltrados,
    turnosAgendaResumen,
    esFechaAgendaPasada,

    // métricas
    totalReservas,
    ingresosCobrados,
    ingresosPendientes
  }
}
