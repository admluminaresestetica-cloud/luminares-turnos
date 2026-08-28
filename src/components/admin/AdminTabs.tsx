// src/components/admin/AdminTabs.tsx
'use client'

import React from 'react'
import { LayoutDashboard, Calendar, Sparkles, Scissors, Clock, Image, Gift, HelpCircle } from 'lucide-react'
import { TabKey } from './types'

interface AdminTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
  totalTurnos: number
  totalGenerales: number
}

export default function AdminTabs({ activeTab, onChange, totalTurnos, totalGenerales }: AdminTabsProps) {
  const tabs = [
    { key: 'overview' as TabKey, short: 'Resumen', label: 'Resumen General', icon: LayoutDashboard },
    { key: 'agenda' as TabKey, short: `Agenda (${totalTurnos})`, label: `Agenda de Turnos (${totalTurnos})`, icon: Calendar },
    { key: 'precios' as TabKey, short: 'Láser', label: 'Editor Depilación (Láser)', icon: Sparkles },
    { key: 'generales' as TabKey, short: `Generales (${totalGenerales})`, label: `Editor Servicios Generales (${totalGenerales})`, icon: Scissors },
    { key: 'horarios' as TabKey, short: 'Horarios', label: 'Editar Horarios', icon: Clock },
    { key: 'banner' as TabKey, short: 'Banner', label: 'Banner Inicio', icon: Image },
    { key: 'referidos' as TabKey, short: 'Referidos', label: 'Programa Referidos', icon: Gift },
    { key: 'faq' as TabKey, short: 'FAQ', label: 'Preguntas Frecuentes', icon: HelpCircle },
  ]

  return (
    <div className="relative mb-6">
      <div className="bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto border border-gray-200/60 shadow-inner scrollbar-hide">
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
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Degradés que insinúan que hay más tabs para scrollear (solo mobile) */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-50 to-transparent sm:hidden rounded-r-2xl" />
      <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-gray-50 to-transparent sm:hidden rounded-l-2xl" />
    </div>
  )
}