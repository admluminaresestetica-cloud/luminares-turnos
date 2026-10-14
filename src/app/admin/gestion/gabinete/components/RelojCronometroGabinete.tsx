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
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 p-3 rounded-xl text-xs">
      {/* Reloj en Vivo */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-lg text-purple-600 dark:text-purple-400">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Hora actual:</span>
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-zinc-700">
            {horaActual || '--:--:--'}
          </span>
        </div>
      </div>

      {/* Cronómetro de Sesión */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Timer className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Sesión:</span>
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 min-w-16 text-center">
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
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Iniciar cronómetro de sesión"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActivo(false)}
              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all active:scale-95 cursor-pointer"
              title="Pausar cronómetro"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            type="button"
            onClick={reiniciarCronometro}
            className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg border border-slate-200/80 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}