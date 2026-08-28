// src/components/admin/tabs/OverviewTab.tsx
'use client'

import { ClipboardList, Wallet, Clock3 } from 'lucide-react'

interface OverviewTabProps {
  totalReservas: number
  ingresosCobrados: number
  ingresosPendientes: number
}

export default function OverviewTab({ totalReservas, ingresosCobrados, ingresosPendientes }: OverviewTabProps) {
  const stats = [
    {
      label: 'Total Reservas Creadas',
      value: totalReservas.toLocaleString('es-AR'),
      icon: ClipboardList,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Recaudación Real (Completados)',
      value: `$${ingresosCobrados.toLocaleString('es-AR')}`,
      icon: Wallet,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Pendiente de Cobro / Estimado',
      value: `$${ingresosPendientes.toLocaleString('es-AR')}`,
      icon: Clock3,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <p className={`text-3xl font-extrabold mt-1 ${stat.valueColor}`}>{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}