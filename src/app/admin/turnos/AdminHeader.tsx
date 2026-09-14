// src/components/admin/AdminHeader.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { LogOut, Calendar, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdminHeaderProps {
  onLogout: () => void
  userEmail?: string
  logoUrl?: string
}

export default function AdminHeader({
  onLogout,
  userEmail,
  logoUrl = '/logo.jpg',
}: AdminHeaderProps) {
  const [email, setEmail] = useState<string>(userEmail || 'Admin')

  useEffect(() => {
    if (userEmail) return
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email)
    })
  }, [userEmail])

  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const fechaFormateada = hoy.charAt(0).toUpperCase() + hoy.slice(1)

  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

        {/* Lado Izquierdo: Logo, Título y Fecha */}
        <div className="flex items-center gap-3 sm:gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Luminares Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover ring-1 ring-gray-100 dark:ring-zinc-800 transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-rose-100 dark:shadow-none transition-transform duration-300 hover:scale-105">
              L
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span className="truncate">Luminares</span>
              <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 whitespace-nowrap">
                Panel
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{fechaFormateada}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Avatar de Usuario y Acción */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-zinc-800">

          {/* Avatar / Usuario */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50/80 dark:bg-zinc-900/80 px-2.5 sm:px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-800 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-300 font-semibold text-xs ring-2 ring-white dark:ring-zinc-950">
                <User className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 rounded-full"></span>
            </div>
            <div className="text-left pr-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200 truncate max-w-[110px] sm:max-w-[180px]">
                {email}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">Administrador</p>
            </div>
          </div>

          {/* Botón Salir */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-95 px-3 py-2.5 sm:py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20 shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>

        </div>
      </div>
    </header>
  )
}