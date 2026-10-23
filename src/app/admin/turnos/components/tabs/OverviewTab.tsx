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
            className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl shadow-xl border border-slate-200/80 dark:border-zinc-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center mb-4 shadow-2xs`}>
              <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.2} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <p className={`text-3xl sm:text-4xl font-black mt-1.5 tracking-tight ${stat.valueColor}`}>
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}