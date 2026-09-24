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
      {/* ===== DESKTOP (>= sm): barra de pestañas superior, cómoda para mouse ===== */}
      <div className="hidden sm:block relative mb-6">
        <div className="bg-gray-100/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl overflow-x-auto border border-gray-200/60 dark:border-zinc-800 shadow-inner [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  onClick={() => onChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50 font-semibold dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-zinc-500'}`} />
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
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-gray-200/70 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                role="tab"
                aria-selected={isActive}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 transition-all duration-150 active:scale-95 select-none ${
                  isActive ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-zinc-500'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400 dark:text-zinc-500'}`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.short}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}