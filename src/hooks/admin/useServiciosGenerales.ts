'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ServicioGeneral } from '@/app/admin/turnos/components/types'

export function useServiciosGenerales() {
  const [serviciosGenerales, setServiciosGenerales] = useState<ServicioGeneral[]>([])
  const [loadingGenerales, setLoadingGenerales] = useState(false)

  const [modalGeneral, setModalGeneral] = useState<boolean>(false)
  const [servicioGeneralEdit, setServicioGeneralEdit] = useState<Partial<ServicioGeneral> | null>(null)

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

  useEffect(() => {
    fetchServiciosGenerales()
  }, [])

  const serviciosGeneralesActivos = useMemo(
    () => serviciosGenerales.filter((s) => s.activo),
    [serviciosGenerales]
  )

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

  const cerrarModalGeneral = () => {
    setModalGeneral(false)
    setServicioGeneralEdit(null)
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

    cerrarModalGeneral()
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

  return {
    serviciosGenerales,
    loadingGenerales,
    serviciosGeneralesActivos,

    modalGeneral,
    servicioGeneralEdit, setServicioGeneralEdit,
    abrirModalGeneral, cerrarModalGeneral,
    guardarServicioGeneral,
    toggleActivoGeneral,
    eliminarServicioGeneral
  }
}