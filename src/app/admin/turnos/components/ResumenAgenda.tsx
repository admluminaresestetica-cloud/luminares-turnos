// src/components/admin/ResumenAgenda.tsx
'use client'

import { DollarSign, ClockCheck } from 'lucide-react'

interface ReservaResumen {
  estado?: string
  precio_total?: number
}

interface ResumenAgendaProps {
  turnos: ReservaResumen[]
  esFechaPasada: boolean
}

export default function ResumenAgenda({ turnos, esFechaPasada }: ResumenAgendaProps) {
  const recaudacionReal = turnos
    .filter((t) => t.estado?.toLowerCase() === 'completado')
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  const recaudacionPendiente = turnos
    .filter((t) => {
      const est = t.estado?.toLowerCase()
      return est !== 'completado' && est !== 'cancelado'
    })
    .reduce((acc, t) => acc + (Number(t.precio_total) || 0), 0)

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 mb-6 rounded-2xl transition-colors">
      <div className={`grid gap-3 ${esFechaPasada ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

        {/* Recaudación Real */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
              {esFechaPasada ? 'Recaudación Real del Período' : 'Recaudación Real (Completados)'}
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ${recaudacionReal.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Pendiente / Estimado */}
        {!esFechaPasada && (
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                Pendiente / Estimado
              </span>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                ${recaudacionPendiente.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
              <ClockCheck className="w-5 h-5" />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}