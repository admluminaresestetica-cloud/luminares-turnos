// src/app/admin/turnos/AdminHeader.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { LogOut, Calendar, User, ShieldCheck, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePerfil } from '@/hooks/usePerfil'

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
  const [email, setEmail] = useState<string>(userEmail || 'Cargando...')
  const { perfil, esAdmin, cargando: cargandoPerfil } = usePerfil()

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail)
      return
    }
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
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-4 transition-all">
      {/* Una sola fila en todos los tamaños (compacto en móvil) */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

        {/* Lado Izquierdo: Logo, Título y Fecha */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Luminares Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl object-cover ring-1 ring-gray-100 dark:ring-zinc-800 transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-rose-100 dark:shadow-none transition-transform duration-300 hover:scale-105">
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
            {/* La fecha se oculta en móvil para mantener el header en 1 fila */}
            <p className="hidden sm:flex text-xs text-gray-500 dark:text-zinc-400 items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{fechaFormateada}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Avatar de Usuario, Rol y Acción */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">

          {/* Avatar / Usuario con datos del hook usePerfil */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50/80 dark:bg-zinc-900/80 pl-1.5 pr-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-100 dark:border-zinc-800 min-w-0">
            <div className="relative shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-300 font-semibold text-xs ring-2 ring-white dark:ring-zinc-950">
                <User className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 rounded-full"></span>
            </div>

            <div className="text-left sm:pr-1 min-w-0">
              {/* El nombre/email solo se muestra desde sm; en móvil queda solo el rol */}
              <p className="hidden sm:block text-xs font-semibold text-gray-700 dark:text-zinc-200 truncate max-w-[180px]">
                {perfil?.nombre || email}
              </p>

              <div className="flex items-center gap-1">
                {!cargandoPerfil && esAdmin ? (
                  <span className="text-[11px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 inline" /> Admin
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <UserCheck className="w-3 h-3 inline" /> Empleado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botón Salir (solo ícono en móvil) */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:scale-95 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20 shrink-0"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>

        </div>
      </div>
    </header>
  )
}