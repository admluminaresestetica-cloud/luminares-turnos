// src/app/admin/turnos/AdminHeader.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, RefreshCw, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const reducirMovimiento = useReducedMotion()
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
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600 dark:from-blue-950 dark:via-indigo-950 dark:to-zinc-900 border-b border-white/10 sticky top-0 z-30 transition-all text-white shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">

        {/* Lado Izquierdo: Botón Volver + Título "Panel de Control" + Logo + Fecha */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={reducirMovimiento ? undefined : { scale: 1.05, y: -0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Link
              href="/admin"
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl border border-white/25 transition-all shadow-xs shrink-0 cursor-pointer inline-flex items-center justify-center"
              title="Volver al Menú Admin"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
          </motion.div>

          <div className="flex items-center gap-3 min-w-0">
            {/* Título Principal */}
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight whitespace-nowrap">
                Panel de Control
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 bg-white/15 text-white border border-white/25 px-2.5 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> En Vivo
              </span>
            </div>

            <span className="text-white/30 hidden lg:inline">•</span>

            {/* Logo y Fecha */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-white/80 font-medium">
              <span className="font-bold text-white">Luminares</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                {fechaFormateada}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Botón Refrescar, Botón Nuevo Turno y Perfil de Usuario */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Botón Refrescar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={reducirMovimiento ? undefined : { scale: 1.05, y: -0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            type="button"
            onClick={onRefrescar}
            className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title="Actualizar turnos"
          >
            <RefreshCw className={`w-4 h-4 ${cargandoRefresco ? 'animate-spin text-white' : ''}`} />
          </motion.button>

          {/* Botón Nuevo Turno */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={reducirMovimiento ? undefined : { scale: 1.05, y: -0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            type="button"
            onClick={onNuevoTurno}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-blue-700 text-xs font-black rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-700" />
            <span className="hidden sm:inline">Nuevo Turno</span>
          </motion.button>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* Avatar / Usuario */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/25 shadow-xs">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 ring-2 ring-blue-600 rounded-full"></span>
            </div>

            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white truncate max-w-[100px] leading-tight">
                {perfil?.nombre || email}
              </p>
              <div className="flex items-center gap-1">
                {!cargandoPerfil && esAdmin ? (
                  <span className="text-[10px] text-blue-200 font-bold">Admin</span>
                ) : (
                  <span className="text-[10px] text-emerald-300 font-bold">Empleado</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.header>
  )
}