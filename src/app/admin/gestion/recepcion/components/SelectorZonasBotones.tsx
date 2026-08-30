'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SelectorProps {
  zonasSeleccionadas: string[]
  setZonasSeleccionadas: (zonas: string[]) => void
}

export default function SelectorZonasBotones({
  zonasSeleccionadas,
  setZonasSeleccionadas,
}: SelectorProps) {
  const [listaZonas, setListaZonas] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarZonas = async () => {
      try {
        const { data, error } = await supabase
          .from('servicios_laser')
          .select('nombre_zona')
          .eq('activo', true)
          .order('nombre_zona', { ascending: true })

        if (error) throw error

        if (data) {
          setListaZonas(data.map((z) => z.nombre_zona))
        }
      } catch (err) {
        console.error('Error al cargar zonas de servicios_laser:', err)
      } finally {
        setCargando(false)
      }
    }

    cargarZonas()
  }, [])

  const toggleZona = (zona: string) => {
    if (zonasSeleccionadas.includes(zona)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter((z) => z !== zona))
    } else {
      setZonasSeleccionadas([...zonasSeleccionadas, zona])
    }
  }

  if (cargando) {
    return <div className="text-xs text-slate-400">Cargando zonas de la base de datos...</div>
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-slate-700">
        ✂️ Zonas a Realizar Hoy (Clic para seleccionar)
      </label>
      <div className="flex flex-wrap gap-2">
        {listaZonas.map((zona) => {
          const seleccionada = zonasSeleccionadas.includes(zona)
          return (
            <button
              key={zona}
              type="button"
              onClick={() => toggleZona(zona)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                seleccionada
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {seleccionada ? '✓ ' : '+ '}
              {zona}
            </button>
          )
        })}
      </div>
    </div>
  )
}