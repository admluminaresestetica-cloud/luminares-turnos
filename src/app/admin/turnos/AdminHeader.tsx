// src/app/admin/turnos/AdminHeader.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, ShieldCheck, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePerfil } from '@/hooks/usePerfil'

interface AdminHeaderProps {
  onLogout?: () => void
  userEmail?: string
  logoUrl?: string
}

export default function AdminHeader({
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
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

        {/* Lado Izquierdo: Botón Volver, Logo, Título y Fecha */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Botón Volver a Admin */}
          <Link
            href="/admin"
            className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl border border-slate-200/80 dark:border-zinc-800 transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            title="Volver al Menú Admin"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          </Link>

          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Luminares Logo"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover ring-1 ring-slate-200/80 dark:ring-zinc-800 transition-transform duration-300 hover:scale-105"
            />
             ) : (
             <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-base shadow-2xs transition-transform duration-300 hover:scale-105 select-none">
             L
             </div>
            )}

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <span className="truncate">Luminares</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700 whitespace-nowrap">
                Panel
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{fechaFormateada}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Avatar de Usuario y Rol */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-zinc-800/80">

          {/* Avatar / Usuario con datos del hook usePerfil */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 min-w-0 shadow-2xs">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-semibold text-xs">
                <User className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 rounded-full"></span>
            </div>

            <div className="text-left pr-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[110px] sm:max-w-[180px]">
                {perfil?.nombre || email}
              </p>
              
              <div className="flex items-center gap-1">
                {!cargandoPerfil && esAdmin ? (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 inline" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <UserCheck className="w-3 h-3 inline" /> Empleado
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}