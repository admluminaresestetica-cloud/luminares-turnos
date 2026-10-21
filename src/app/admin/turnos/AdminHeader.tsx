// src/app/admin/turnos/AdminHeader.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, ShieldCheck, UserCheck, RefreshCw, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePerfil } from '@/hooks/usePerfil'

interface AdminHeaderProps {
  onLogout?: () => void
  userEmail?: string
  onRefrescar?: () => void | Promise<void>
  onNuevoTurno?: () => void
  cargandoRefresco?: boolean
}

export default function AdminHeader({
  userEmail,
  onRefrescar,
  onNuevoTurno,
  cargandoRefresco,
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
    <header className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Lado Izquierdo: Botón Volver + Título "Panel de Control" + Logo + Fecha */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin"
            className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl border border-slate-200/80 dark:border-zinc-800 transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            title="Volver al Menú Admin"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          </Link>

          <div className="flex items-center gap-3 min-w-0">
            {/* Título Principal */}
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
                Panel de Control
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En Vivo
              </span>
            </div>

            <span className="text-slate-300 dark:text-zinc-700 hidden lg:inline">•</span>

            {/* Logo y Fecha */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Luminares</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                {fechaFormateada}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Botón Refrescar, Botón Nuevo Turno y Perfil de Usuario */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Botón Refrescar */}
          <button
            type="button"
            onClick={onRefrescar}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
            title="Actualizar turnos"
          >
            <RefreshCw className={`w-4 h-4 ${cargandoRefresco ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {/* Botón Nuevo Turno */}
          <button
            type="button"
            onClick={onNuevoTurno}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Turno</span>
          </button>

          <span className="text-slate-200 dark:text-zinc-800 hidden sm:inline">|</span>

          {/* Avatar / Usuario */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 text-xs">
                <User className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 rounded-full"></span>
            </div>

            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[100px] leading-tight">
                {perfil?.nombre || email}
              </p>
              <div className="flex items-center gap-1">
                {!cargandoPerfil && esAdmin ? (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Admin</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Empleado</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  )
}