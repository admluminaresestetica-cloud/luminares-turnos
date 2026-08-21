'use client'

import React from 'react'
import { LayoutDashboard, Calendar, Sparkles, Scissors, Clock, Image, Gift } from 'lucide-react'
import { TabKey } from './types'

interface AdminTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
  totalTurnos: number
  totalGenerales: number
}

export default function AdminTabs({ activeTab, onChange, totalTurnos, totalGenerales }: AdminTabsProps) {
  const tabs = [
    { key: 'overview' as TabKey, label: 'Resumen General', icon: LayoutDashboard },
    { key: 'agenda' as TabKey, label: `Agenda de Turnos (${totalTurnos})`, icon: Calendar },
    { key: 'precios' as TabKey, label: 'Editor Depilación (Láser)', icon: Sparkles },
    { key: 'generales' as TabKey, label: `Editor Servicios Generales (${totalGenerales})`, icon: Scissors },
    { key: 'horarios' as TabKey, label: 'Editar Horarios', icon: Clock },
    { key: 'banner' as TabKey, label: 'Banner Inicio', icon: Image },
    { key: 'referidos' as TabKey, label: 'Programa Referidos', icon: Gift },
  ]

  return (
    <div className="bg-gray-100/80 p-1.5 rounded-2xl mb-6 overflow-x-auto border border-gray-200/60 shadow-inner">
      <div className="flex gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-rose-500' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}