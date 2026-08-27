'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ServicioLaser,
  PromoLaser,
  ServicioGeneral,
  ConfigCalendario,
  HorariosSemana,
  horariosSemanaDefault
} from '@/components/admin/types'

export function useCatalogo() {
  const [servicios, setServicios] = useState<ServicioLaser[]>([])
  const [promos, setPromos] = useState<PromoLaser[]>([])
  const [loadingPrecios, setLoadingPrecios] = useState(false)

  const [serviciosGenerales, setServiciosGenerales] = useState<ServicioGeneral[]>([])
  const [loadingGenerales, setLoadingGenerales] = useState(false)

  const [configLaser, setConfigLaser] = useState<ConfigCalendario>({
    tipo_servicio: 'laser',
    horarios_atencion: { inicio: '09:00', fin: '18:00' },
    fechas_habilitadas_laser: []
  })
  const [configGeneral, setConfigGeneral] = useState<ConfigCalendario>({
    tipo_servicio: 'general',
    horarios_atencion: { ...horariosSemanaDefault(), excepciones: [] as string[] }
  })

  const [referidosActivo, setReferidosActivo] = useState<boolean>(true)
  const [referidosTipoDescuento, setReferidosTipoDescuento] = useState<'porcentaje' | 'monto_fijo'>(
    'porcentaje'
  )
  const [referidosValorDescuento, setReferidosValorDescuento] = useState<number>(10)

  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [guardandoLaser, setGuardandoLaser] = useState(false)
  const [guardandoGeneral, setGuardandoGeneral] = useState(false)
  const [nuevaFechaLaser, setNuevaFechaLaser] = useState<string>('')
  const [nuevaExcepcionGeneral, setNuevaExcepcionGeneral] = useState<string>('')

  const [seccionPrecios, setSeccionPrecios] = useState<'servicios' | 'promos'>('servicios')

  // Modales - Servicios Laser
  const [modalServicio, setModalServicio] = useState<boolean>(false)
  const [servicioEdit, setServicioEdit] = useState<Partial<ServicioLaser> | null>(null)

  // Modales - Promos
  const [modalPromo, setModalPromo] = useState<boolean>(false)
  const [promoEdit, setPromoEdit] = useState<Partial<PromoLaser> | null>(null)

  // Modales - Servicios Generales
  const [modalGeneral, setModalGeneral] = useState<boolean>(false)
  const [servicioGeneralEdit, setServicioGeneralEdit] = useState<Partial<ServicioGeneral> | null>(null)

  // --- CARGA DE DATOS ---
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
    const { data, error } = await supabase.from('configuracion_calendario').select('*')

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
    fetchPreciosYPromos()
    fetchServiciosGenerales()
    fetchConfigCalendario()
  }, [])

  // --- SERVICIOS LASER ---
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
      const { error } = await supabase.from('servicios_laser').insert([
        {
          genero: servicioEdit.genero,
          nombre_zona: servicioEdit.nombre_zona,
          categoria_zona: servicioEdit.categoria_zona,
          precio_lista: Number(servicioEdit.precio_lista),
          duracion_minutos: Number(servicioEdit.duracion_minutos),
          activo: servicioEdit.activo ?? true
        }
      ])

      if (error) alert('Error al crear zona: ' + error.message)
    }

    setModalServicio(false)
    fetchPreciosYPromos()
  }

  const toggleActivoServicio = async (serv: ServicioLaser) => {
    const nuevoEstado = !serv.activo
    const { error } = await supabase.from('servicios_laser').update({ activo: nuevoEstado }).eq('id', serv.id)

    if (!error) {
      setServicios((prev) => prev.map((s) => (s.id === serv.id ? { ...s, activo: nuevoEstado } : s)))
    } else {
      alert('Error al actualizar servicio: ' + error.message)
    }
  }

  const eliminarServicio = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta zona permanentemente?')) return

    const { error } = await supabase.from('servicios_laser').delete().eq('id', id)

    if (!error) {
      setServicios((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert('Error al eliminar servicio: ' + error.message)
    }
  }

  // --- PROMOS ---
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

    const nuevas = existe ? actuales.filter((id) => id !== zonaId) : [...actuales, zonaId]
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
      const { error } = await supabase.from('promos_laser').insert([
        {
          genero: promoEdit.genero,
          nombre_promo: promoEdit.nombre_promo,
          zonas_incluidas: promoEdit.zonas_incluidas,
          precio_promo: Number(promoEdit.precio_promo),
          duracion_total_min: Number(promoEdit.duracion_total_min),
          permite_swap: promoEdit.permite_swap ?? false,
          activo: promoEdit.activo ?? true
        }
      ])

      if (error) alert('Error al crear promo: ' + error.message)
    }

    setModalPromo(false)
    fetchPreciosYPromos()
  }

  const toggleActivoPromo = async (promo: PromoLaser) => {
    const nuevoEstado = !promo.activo
    const { error } = await supabase.from('promos_laser').update({ activo: nuevoEstado }).eq('id', promo.id)

    if (!error) {
      setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, activo: nuevoEstado } : p)))
    } else {
      alert('Error al actualizar promoción: ' + error.message)
    }
  }

  const eliminarPromo = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta promoción permanentemente?')) return

    const { error } = await supabase.from('promos_laser').delete().eq('id', id)

    if (!error) {
      setPromos((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert('Error al eliminar promoción: ' + error.message)
    }
  }

  // --- SERVICIOS GENERALES ---
  const abrirModalGeneral = (serv?: ServicioGeneral) => {
    if (serv) {
      setServicioGeneralEdit({ ...serv })
    } else {
      setServicioGeneralEdit({
        categoria: '',
        subtipo: '',
        precio: 0,
        duracion_minutos: 30,
        activo: true,
        descripcion: '',
        imagen_url: ''
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
      activo: servicioGeneralEdit.activo ?? true,
      descripcion: servicioGeneralEdit.descripcion || '',
      imagen_url: servicioGeneralEdit.imagen_url || ''
    }

    if (servicioGeneralEdit.id) {
      const { error } = await supabase.from('servicios_generales').update(payload).eq('id', servicioGeneralEdit.id)

      if (error) {
        alert('Error al actualizar el servicio: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase.from('servicios_generales').insert([payload])

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
    const { error } = await supabase.from('servicios_generales').update({ activo: nuevoEstado }).eq('id', serv.id)

    if (!error) {
      setServiciosGenerales((prev) => prev.map((s) => (s.id === serv.id ? { ...s, activo: nuevoEstado } : s)))
    } else {
      alert('Error al actualizar el estado: ' + error.message)
    }
  }

  const eliminarServicioGeneral = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este servicio permanentemente?')) return

    const { error } = await supabase.from('servicios_generales').delete().eq('id', id)

    if (!error) {
      setServiciosGenerales((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert('Error al eliminar el servicio: ' + error.message)
    }
  }

  // --- CONFIGURACIÓN DE CALENDARIO / HORARIOS ---
  const actualizarRangoLaser = (campo: 'inicio' | 'fin', valor: string) => {
    setConfigLaser((prev) => ({
      ...prev,
      horarios_atencion: { ...prev.horarios_atencion, [campo]: valor }
    }))
  }

  const agregarFechaLaser = () => {
    if (!nuevaFechaLaser) return
    setConfigLaser((prev) => {
      const actuales = prev.fechas_habilitadas_laser || []
      if (actuales.includes(nuevaFechaLaser)) return prev
      return { ...prev, fechas_habilitadas_laser: [...actuales, nuevaFechaLaser].sort() }
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

    const fechasLimpias = (configLaser.fechas_habilitadas_laser || []).map((f: string) => String(f).slice(0, 10))

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
      const { error } = await supabase.from('configuracion_calendario').update(payload).eq('id', configLaser.id)

      if (error) {
        alert('Error al guardar la configuración de láser: ' + error.message)
        setGuardandoLaser(false)
        return
      }
    } else {
      const { data, error } = await supabase.from('configuracion_calendario').insert([payload]).select().single()

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
        [dia]: { ...prev.horarios_atencion[dia], abierto: !prev.horarios_atencion[dia].abierto }
      }
    }))
  }

  const actualizarHorarioGeneral = (dia: keyof HorariosSemana, campo: 'inicio' | 'fin', valor: string) => {
    setConfigGeneral((prev) => ({
      ...prev,
      horarios_atencion: {
        ...prev.horarios_atencion,
        [dia]: { ...prev.horarios_atencion[dia], [campo]: valor }
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
        horarios_atencion: { ...prev.horarios_atencion, excepciones: [...actuales, nuevaExcepcionGeneral].sort() }
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
      horarios_atencion: { ...horarios, bloques: horarios.bloques || bloquesCalculados },
      updated_at: new Date().toISOString()
    }

    if (configGeneral.id) {
      const { error } = await supabase.from('configuracion_calendario').update(payload).eq('id', configGeneral.id)

      if (error) {
        alert('Error al guardar los horarios generales: ' + error.message)
        setGuardandoGeneral(false)
        return
      }
    } else {
      const { data, error } = await supabase.from('configuracion_calendario').insert([payload]).select().single()

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

  return {
    // precios / promos
    servicios,
    promos,
    loadingPrecios,
    seccionPrecios,
    setSeccionPrecios,
    modalServicio,
    setModalServicio,
    servicioEdit,
    setServicioEdit,
    abrirModalServicio,
    guardarServicio,
    toggleActivoServicio,
    eliminarServicio,
    modalPromo,
    setModalPromo,
    promoEdit,
    setPromoEdit,
    abrirModalPromo,
    toggleZonaEnPromo,
    guardarPromo,
    toggleActivoPromo,
    eliminarPromo,

    // generales
    serviciosGenerales,
    loadingGenerales,
    modalGeneral,
    setModalGeneral,
    servicioGeneralEdit,
    setServicioGeneralEdit,
    abrirModalGeneral,
    guardarServicioGeneral,
    toggleActivoGeneral,
    eliminarServicioGeneral,

    // referidos (usados dentro de GeneralesTab)
    referidosActivo,
    setReferidosActivo,
    referidosTipoDescuento,
    setReferidosTipoDescuento,
    referidosValorDescuento,
    setReferidosValorDescuento,

    // horarios
    configLaser,
    configGeneral,
    loadingHorarios,
    guardandoLaser,
    guardandoGeneral,
    nuevaFechaLaser,
    setNuevaFechaLaser,
    nuevaExcepcionGeneral,
    setNuevaExcepcionGeneral,
    actualizarRangoLaser,
    agregarFechaLaser,
    quitarFechaLaser,
    guardarConfigLaser,
    toggleDiaGeneral,
    actualizarHorarioGeneral,
    agregarExcepcionGeneral,
    quitarExcepcionGeneral,
    guardarConfigGeneral
  }
}
