'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Play, Pause, RotateCcw, Timer } from 'lucide-react'

interface RelojCronometroProps {
  onTiempoActualizado?: (segundos: number) => void
}

export default function RelojCronometroGabinete({ onTiempoActualizado }: RelojCronometroProps) {
  // Estado para el Reloj en Vivo (Hora actual)
  const [horaActual, setHoraActual] = useState<string>('')

  // Estado para el Cronómetro
  const [segundos, setSegundos] = useState<number>(0)
  const [activo, setActivo] = useState<boolean>(false)

  // Efecto para actualizar el reloj digital cada segundo
  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date()
      setHoraActual(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    actualizarReloj()
    const timerReloj = setInterval(actualizarReloj, 1000)
    return () => clearInterval(timerReloj)
  }, [])

  // Efecto para el funcionamiento del cronómetro
  useEffect(() => {
    let intervalo: NodeJS.Timeout | null = null
    if (activo) {
      intervalo = setInterval(() => {
        setSegundos((prev) => {
          const nuevoTiempo = prev + 1
          if (onTiempoActualizado) {
            onTiempoActualizado(nuevoTiempo)
          }
          return nuevoTiempo
        })
      }, 1000)
    } else if (!activo && segundos !== 0 && intervalo) {
      clearInterval(intervalo)
    }
    return () => {
      if (intervalo) clearInterval(intervalo)
    }
  }, [activo, onTiempoActualizado])

  // Formatear segundos a MM:SS
  const formatearTiempo = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const reiniciarCronometro = () => {
    setActivo(false)
    setSegundos(0)
    if (onTiempoActualizado) onTiempoActualizado(0)
  }

return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl text-xs text-white shadow-lg">
      {/* Reloj en Vivo */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-white/15 border border-white/20 rounded-xl text-white">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-blue-100/80 uppercase tracking-wider">Hora actual:</span>
          <span className="font-mono text-xs font-bold text-white bg-white/15 px-3 py-1 rounded-xl border border-white/20 shadow-xs">
            {horaActual || '--:--:--'}
          </span>
        </div>
      </div>

      {/* Cronómetro de Sesión */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/15 border border-white/20 rounded-xl text-white">
            <Timer className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-blue-100/80 uppercase tracking-wider">Sesión:</span>
            <span className="font-mono text-xs font-bold text-white bg-white/15 border border-white/20 px-3 py-1 rounded-xl min-w-16 text-center shadow-xs">
              {formatearTiempo(segundos)}
            </span>
          </div>
        </div>

        {/* Botones de Control */}
        <div className="flex items-center gap-1.5">
          {!activo ? (
            <button
              type="button"
              onClick={() => setActivo(true)}
              className="p-2 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Iniciar cronómetro de sesión"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActivo(false)}
              className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Pausar cronómetro"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={reiniciarCronometro}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}