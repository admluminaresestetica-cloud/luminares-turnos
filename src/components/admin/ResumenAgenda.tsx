// src/components/admin/ResumenAgenda.tsx
'use client'

import { DollarSign, ClockCheck, TrendingUp } from 'lucide-react'

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
    <div className="p-4 bg-gray-50/50 border border-gray-100 mb-6 rounded-2xl">
      <div className={`grid gap-3 ${esFechaPasada ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

        {/* Recaudación Real */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              {esFechaPasada ? 'Recaudación Real del Período' : 'Recaudación Real (Completados)'}
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              ${recaudacionReal.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Pendiente / Estimado */}
        {!esFechaPasada && (
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Pendiente / Estimado
              </span>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                ${recaudacionPendiente.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
              <ClockCheck className="w-5 h-5" />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}