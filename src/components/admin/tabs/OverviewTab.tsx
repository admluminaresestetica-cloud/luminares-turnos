// src/components/admin/tabs/OverviewTab.tsx
'use client'

interface OverviewTabProps {
  totalReservas: number
  ingresosCobrados: number
  ingresosPendientes: number
}

export default function OverviewTab({ totalReservas, ingresosCobrados, ingresosPendientes }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-medium text-gray-500">Total Reservas Creadas</span>
        <p className="text-3xl font-extrabold mt-2">{totalReservas}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-medium text-gray-500">Recaudación Real (Completados)</span>
        <p className="text-3xl font-extrabold mt-2 text-emerald-600">
          ${ingresosCobrados.toLocaleString('es-AR')}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-medium text-gray-500">Pendiente de Cobro / Estimado</span>
        <p className="text-3xl font-extrabold mt-2 text-blue-600">
          ${ingresosPendientes.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  )
}