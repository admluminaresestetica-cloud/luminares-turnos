'use client'

import React, { useState } from 'react'
import BannerTab from './BannerTab'
import BannersTab from './BannersTab'

export default function BannersAjustesTab() {
  const [seccion, setSeccion] = useState<'inicio' | 'tienda'>('inicio')

  return (
    <div className="space-y-6">
      {/* Selector de Sub-pestaña */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setSeccion('inicio')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            seccion === 'inicio'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          Banners Inicio / Agenda
        </button>

        <button
          onClick={() => setSeccion('tienda')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            seccion === 'tienda'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          Banners E-Commerce / Tienda
        </button>
      </div>

      {/* Render condicional */}
      {seccion === 'inicio' && <BannerTab />}
      {seccion === 'tienda' && <BannersTab />}
    </div>
  )
}