'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PromoLaser, ServicioLaser } from '@/components/admin/types'

export function usePreciosLaser() {
  const [servicios, setServicios] = useState<ServicioLaser[]>([])
  const [promos, setPromos] = useState<PromoLaser[]>([])
  const [loadingPrecios, setLoadingPrecios] = useState(false)
  const [seccionPrecios, setSeccionPrecios] = useState<'servicios' | 'promos'>('servicios')

  const [modalServicio, setModalServicio] = useState<boolean>(false)
  const [servicioEdit, setServicioEdit] = useState<Partial<ServicioLaser> | null>(null)

  const [modalPromo, setModalPromo] = useState<boolean>(false)
  const [promoEdit, setPromoEdit] = useState<Partial<PromoLaser> | null>(null)

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

  useEffect(() => {
    fetchPreciosYPromos()
  }, [])

  const serviciosLaserActivos = useMemo(
    () => servicios.filter((s) => s.activo),
    [servicios]
  )

  const abrirModalServicio = (serv?: ServicioLaser) => {
    if (serv) {
      setServicioEdit({ ...serv })
    } else {
      setServicioEdit({
        genero: 'femenino',
        nombre_zona: '',
        categoria_zona: 'chica,media o media',
        precio_lista: 0,
        duracion_minutos: 15,
        activo: true
      })
    }
    setModalServicio(true)
  }

  const cerrarModalServicio = () => setModalServicio(false)

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

  const cerrarModalPromo = () => setModalPromo(false)

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

  return {
    servicios,
    promos,
    loadingPrecios,
    seccionPrecios, setSeccionPrecios,
    serviciosLaserActivos,

    modalServicio, servicioEdit, setServicioEdit,
    abrirModalServicio, cerrarModalServicio, guardarServicio,
    toggleActivoServicio, eliminarServicio,

    modalPromo, promoEdit, setPromoEdit,
    abrirModalPromo, cerrarModalPromo, toggleZonaEnPromo,
    guardarPromo, toggleActivoPromo, eliminarPromo
  }
}