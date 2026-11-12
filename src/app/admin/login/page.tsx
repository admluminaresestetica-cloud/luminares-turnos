'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Mail, ArrowRight, Loader2, } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const reducirMovimiento = useReducedMotion()

  // Cliente de Supabase adaptado para SSR y Cookies en Next.js
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Autenticación directa con correo y contraseña en Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError || !data?.session) {
        setError('Correo o contraseña incorrectos. Verificá tus datos.')
        setLoading(false)
        return
      }

      // Refrescar el estado del servidor y redirigir al panel de administración
      router.refresh()
      window.location.href = '/admin'
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || 'Desconocido'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-950 px-4 transition-colors relative overflow-hidden font-sans">
      
      {/* Orbes de luz decorativos de fondo estilo fintech */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-violet-500/15 dark:bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full relative z-10 space-y-8 rounded-[28px] border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl transition-colors"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
          >
            <Lock className="h-6 w-6" />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-3 text-[11px] font-black tracking-widest text-blue-700 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 rounded-full">
            <Lock className="w-3 h-3" /> Panel Privado
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            Luminares Admin
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Ingresá tus credenciales para acceder al sistema
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-2xl shadow-xs"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-xs"
                  placeholder="admin@luminares.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-200 shadow-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={reducirMovimiento ? undefined : { y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}