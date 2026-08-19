'use client'

interface ReservaResumen {
  estado?: string
  precio_total?: number
}

interface ResumenAgendaProps {
  turnos: ReservaResumen[]
  esFechaPasada: boolean
}

export default function ResumenAgenda({ turnos, esFechaPasada }: ResumenAgendaProps) {
  // .toLowerCase() para evitar fallos si viene 'Completado' o 'completado'
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
    <div className="px-4 py-4 bg-gray-50 border-b border-gray-100 mb-4 rounded-lg">
      <div className={`grid gap-4 ${esFechaPasada ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-gray-500">
            {esFechaPasada ? 'Recaudación Real del Período' : 'Recaudación Real (Completados)'}
          </span>
          <p className="text-2xl font-extrabold mt-1 text-emerald-600">
            ${recaudacionReal.toLocaleString('es-AR')}
          </p>
        </div>

        {!esFechaPasada && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs font-medium text-gray-500">Pendiente / Estimado</span>
            <p className="text-2xl font-extrabold mt-1 text-blue-600">
              ${recaudacionPendiente.toLocaleString('es-AR')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}