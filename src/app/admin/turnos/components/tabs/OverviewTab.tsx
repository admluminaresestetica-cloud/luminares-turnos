'use client'

import { ClipboardList, Wallet, Clock3 } from 'lucide-react'

interface OverviewTabProps {
  totalReservas?: number
  ingresosCobrados?: number
  ingresosPendientes?: number
}

const formatCurrency = (amount: number = 0) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (value: number = 0) => {
  return value.toLocaleString('es-AR')
}

export default function OverviewTab({
  totalReservas = 0,
  ingresosCobrados = 0,
  ingresosPendientes = 0
}: OverviewTabProps) {
  const stats = [
    {
      label: 'Total Reservas Creadas',
      value: formatNumber(totalReservas),
      icon: ClipboardList,
      iconBg: 'bg-gray-100 dark:bg-zinc-800',
      iconColor: 'text-gray-600 dark:text-zinc-400',
      valueColor: 'text-gray-900 dark:text-zinc-100',
    },
    {
      label: 'Recaudación Real (Completados)',
      value: formatCurrency(ingresosCobrados),
      icon: Wallet,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pendiente de Cobro / Estimado',
      value: formatCurrency(ingresosPendientes),
      icon: Clock3,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.label}</span>
            <p className={`text-3xl font-extrabold mt-1 tracking-tight ${stat.valueColor}`}>{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}