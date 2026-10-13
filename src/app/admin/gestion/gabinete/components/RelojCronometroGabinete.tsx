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
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
      {/* Reloj en Vivo */}
      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Hora actual:</span>
        <span className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{horaActual || '--:--:--'}</span>
      </div>

      {/* Cronómetro de Sesión */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sesión:</span>
          <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-50 w-16">
            {formatearTiempo(segundos)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!activo ? (
            <button
              onClick={() => setActivo(true)}
              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 rounded-lg transition-all"
              title="Iniciar cronómetro de sesión"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setActivo(false)}
              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 rounded-lg transition-all"
              title="Pausar cronómetro"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={reiniciarCronometro}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-lg transition-all"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}