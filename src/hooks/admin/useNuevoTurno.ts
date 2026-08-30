'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Reserva,
  ServicioGeneral,
  ServicioLaser,
  TurnoForm,
  turnoFormVacio,
  datetimeLocalToIso
} from '@/app/admin/turnos/components/types'

interface UseNuevoTurnoParams {
  servicios: ServicioLaser[]
  serviciosGenerales: ServicioGeneral[]
  serviciosLaserActivos: ServicioLaser[]
  serviciosGeneralesActivos: ServicioGeneral[]
  setTurnos: React.Dispatch<React.SetStateAction<Reserva[]>>
}

export function useNuevoTurno({
  servicios,
  serviciosGenerales,
  serviciosLaserActivos,
  serviciosGeneralesActivos,
  setTurnos
}: UseNuevoTurnoParams) {
  const [tipoTurnoNuevo, setTipoTurnoNuevo] = useState<'laser' | 'general'>('laser')
  const [filtroGeneroLaserNuevo, setFiltroGeneroLaserNuevo] = useState<string>('todos')
  const [zonasSeleccionadasNuevo, setZonasSeleccionadasNuevo] = useState<string[]>([])
  const [servicioGeneralSeleccionadoNuevo, setServicioGeneralSeleccionadoNuevo] = useState<string>('')

  const [modalNuevoTurno, setModalNuevoTurno] = useState<boolean>(false)
  const [nuevoTurno, setNuevoTurno] = useState<TurnoForm>(turnoFormVacio())
  const [guardandoNuevoTurno, setGuardandoNuevoTurno] = useState(false)

  const zonasLaserFiltradas = serviciosLaserActivos.filter(
    (s) => filtroGeneroLaserNuevo === 'todos' || s.genero === filtroGeneroLaserNuevo
  )

  const toggleZonaSeleccionadaNuevo = (id: string) => {
    setZonasSeleccionadasNuevo((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  // Recalcula precio y detalle automáticamente
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

  const abrirModalNuevoTurno = () => {
    setNuevoTurno(turnoFormVacio())
    setTipoTurnoNuevo('laser')
    setFiltroGeneroLaserNuevo('todos')
    setZonasSeleccionadasNuevo([])
    setServicioGeneralSeleccionadoNuevo('')
    setModalNuevoTurno(true)
  }

  const cerrarModalNuevoTurno = () => setModalNuevoTurno(false)

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

  return {
    modalNuevoTurno,
    abrirModalNuevoTurno,
    cerrarModalNuevoTurno,

    nuevoTurno, setNuevoTurno,
    tipoTurnoNuevo, setTipoTurnoNuevo,
    filtroGeneroLaserNuevo, setFiltroGeneroLaserNuevo,
    zonasSeleccionadasNuevo, toggleZonaSeleccionadaNuevo,
    zonasLaserFiltradas,
    servicioGeneralSeleccionadoNuevo, setServicioGeneralSeleccionadoNuevo,

    guardandoNuevoTurno,
    crearTurnoManual
  }
}