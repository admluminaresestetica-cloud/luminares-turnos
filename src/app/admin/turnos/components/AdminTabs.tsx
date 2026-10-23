'use client'

import React from 'react'
import { LayoutDashboard, Calendar } from 'lucide-react'
import { TabKey } from './types'

interface AdminTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
  totalTurnos: number
  totalGenerales: number
}

export default function AdminTabs({ activeTab, onChange, totalTurnos }: AdminTabsProps) {
  const tabs = [
    { key: 'overview' as TabKey, short: 'Resumen', label: 'Resumen General', icon: LayoutDashboard },
    { key: 'agenda' as TabKey, short: `Agenda (${totalTurnos})`, label: `Agenda de Turnos (${totalTurnos})`, icon: Calendar },
  ]

return (
    <>
      {/* ===== DESKTOP (>= sm): barra de pestañas superior translúcida fintech ===== */}
      <div className="hidden sm:block relative mb-6">
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl overflow-x-auto border border-white/20 shadow-inner [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
          <div className="flex gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95 whitespace-nowrap select-none cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-md border border-white dark:bg-zinc-900 dark:text-blue-400 dark:border-zinc-800'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-white/80'}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== MOBILE (< sm): Bottom Navigation Bar fija, estilo app nativa ===== */}
      <nav
        role="tablist"
        aria-label="Navegación principal"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-800/80 pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                role="tab"
                aria-selected={isActive}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 transition-all duration-150 active:scale-95 select-none cursor-pointer ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[11px] leading-none ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {tab.short}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}