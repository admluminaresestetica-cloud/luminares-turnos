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
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* Lado Izquierdo: Logo, Título y Fecha */}
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Luminares Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-rose-100 transition-transform duration-300 hover:scale-105">
              L
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              Luminares <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">Panel</span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{fechaFormateada}</span>
            </p>
          </div>
        </div>

        {/* Lado Derecho: Avatar de Usuario y Acción */}
        <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">

          {/* Avatar / Usuario */}
          <div className="flex items-center gap-3 bg-gray-50/80 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs border border-white">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left pr-1">
              <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px] sm:max-w-[180px]">
                {email}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">Administrador</p>
            </div>
          </div>

          {/* Botón Salir */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 px-3 py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100"
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