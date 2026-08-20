// src/components/admin/AdminTabs.tsx
'use client'

import { TabKey } from './types'

interface AdminTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
  totalTurnos: number
  totalGenerales: number
}

export default function AdminTabs({ activeTab, onChange, totalTurnos, totalGenerales }: AdminTabsProps) {
  const tabClass = (tab: TabKey) =>
    `pb-3 px-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
      activeTab === tab
        ? 'border-black text-black'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  return (
    <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
      <button onClick={() => onChange('overview')} className={tabClass('overview')}>
        Resumen General
      </button>
      <button onClick={() => onChange('agenda')} className={tabClass('agenda')}>
        Agenda de Turnos ({totalTurnos})
      </button>
      <button onClick={() => onChange('precios')} className={tabClass('precios')}>
        Editor Depilacion (Láser)
      </button>
      <button onClick={() => onChange('generales')} className={tabClass('generales')}>
        Editor Servicios Generales ({totalGenerales})
      </button>
      <button onClick={() => onChange('horarios')} className={tabClass('horarios')}>
        Editar Horarios
      </button>
    </div>
  )
}