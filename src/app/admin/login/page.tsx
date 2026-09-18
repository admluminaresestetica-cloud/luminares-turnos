'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] dark:bg-stone-950 px-4 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-2xl shadow-sm border border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-widest text-stone-600 dark:text-stone-400 uppercase bg-stone-100 dark:bg-stone-800 rounded-full">
            Panel Privado
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Luminares Admin
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Ingresá tus credenciales para acceder al sistema
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:outline-none transition"
                placeholder="admin@luminares.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-400 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}