'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ConfigCalendario,
  HorariosSemana,
  horariosSemanaDefault
} from '@/components/admin/types'

export function useConfigCalendario() {
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
    fetchConfigCalendario()
  }, [])

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

  return {
    configLaser,
    guardandoLaser,
    nuevaFechaLaser, setNuevaFechaLaser,
    actualizarRangoLaser,
    agregarFechaLaser,
    quitarFechaLaser,
    guardarConfigLaser,

    configGeneral,
    guardandoGeneral,
    nuevaExcepcionGeneral, setNuevaExcepcionGeneral,
    toggleDiaGeneral,
    actualizarHorarioGeneral,
    agregarExcepcionGeneral,
    quitarExcepcionGeneral,
    guardarConfigGeneral,

    loadingHorarios
  }
}