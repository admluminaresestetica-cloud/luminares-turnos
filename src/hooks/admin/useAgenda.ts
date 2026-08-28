'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Reserva,
  TurnoForm,
  isoToDatetimeLocal,
  datetimeLocalToIso,
  renderDetalle
} from '@/components/admin/types'

export function useAgenda() {
  const [turnos, setTurnos] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState<string>('')
  const [filtroFechaTipo, setFiltroFechaTipo] = useState<'todos' | 'hoy' | 'especifica'>('todos')
  const [fechaEspecifica, setFechaEspecifica] = useState<string>('')

  const [modalEditarTurno, setModalEditarTurno] = useState<boolean>(false)
  const [turnoEdit, setTurnoEdit] = useState<TurnoForm | null>(null)
  const [guardandoEdicionTurno, setGuardandoEdicionTurno] = useState(false)

  const [turnoACobrar, setTurnoACobrar] = useState<Reserva | null>(null)
  const [medioPagoSeleccionado, setMedioPagoSeleccionado] = useState<string>('efectivo')
  const [guardandoCobro, setGuardandoCobro] = useState(false)

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

  useEffect(() => {
    fetchTurnos()
  }, [])

  // Filtrado de la tabla principal de agenda
  const turnosFiltrados = turnos.filter((t) => {
    if (filtroEstado !== 'todos' && (t.estado || 'pendiente') !== filtroEstado) return false
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase()
      const nombre = (t.cliente_nombre || '').toLowerCase()
      const celular = (t.cliente_celular || '').toLowerCase()
      const codigo = (t.codigo_unico || '').toLowerCase()
      const referido = (t.codigo_referido_usado || '').toLowerCase()

      if (!nombre.includes(q) && !celular.includes(q) && !codigo.includes(q) && !referido.includes(q)) return false
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

  // Resumen para el widget de recaudación de la Agenda
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

  const cerrarModalEditarTurno = () => {
    setModalEditarTurno(false)
    setTurnoEdit(null)
  }

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

    cerrarModalEditarTurno()
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

  const cerrarModalCobro = () => setTurnoACobrar(null)

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

  const totalReservas = turnos.length
  const ingresosCobrados = turnos
    .filter((t) => t.estado === 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)
  const ingresosPendientes = turnos
    .filter((t) => t.estado !== 'cancelado' && t.estado !== 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  return {
    turnos,
    setTurnos,
    loading,
    fetchTurnos,

    filtroEstado, setFiltroEstado,
    busqueda, setBusqueda,
    filtroFechaTipo, setFiltroFechaTipo,
    fechaEspecifica, setFechaEspecifica,

    turnosFiltrados,
    turnosAgendaResumen,
    esFechaAgendaPasada,

    modalEditarTurno,
    turnoEdit, setTurnoEdit,
    guardandoEdicionTurno,
    abrirModalEditarTurno,
    cerrarModalEditarTurno,
    guardarEdicionTurno,

    actualizarEstado,

    turnoACobrar,
    medioPagoSeleccionado, setMedioPagoSeleccionado,
    guardandoCobro,
    confirmarCobro,
    cerrarModalCobro,

    totalReservas,
    ingresosCobrados,
    ingresosPendientes
  }
}