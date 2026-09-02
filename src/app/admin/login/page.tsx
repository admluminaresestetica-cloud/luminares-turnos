'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Cliente de Supabase adaptado para SSR y Cookies en Next.js
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // PASO 1: Enviar credenciales a la API para verificar y mandar el código por mail
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const dataRes = await res.json()

      if (!res.ok) {
        setError(dataRes.error || 'Credenciales incorrectas o error al enviar el código.')
        setLoading(false)
        return
      }

      setStep('otp')
      setLoading(false)
    } catch (err: any) {
      setError(`Error inesperado: ${err.message || 'Desconocido'}`)
      setLoading(false)
    }
  }

  // PASO 2: Verificar el código de 6 dígitos e iniciar sesión definitivamente
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Validar el código en la tabla codigos_admin
      const { data: registros, error: dbError } = await supabase
        .from('codigos_admin')
        .select('*')
        .eq('email', email)
        .eq('codigo', codigo)
        .single()

      if (dbError || !registros) {
        setError('El código ingresado es incorrecto.')
        setLoading(false)
        return
      }

      // 2. Validar si el código expiró (usando expires_at o expira_at por compatibilidad)
      const fechaExpiracion = registros.expires_at || registros.expira_at
      if (fechaExpiracion && new Date() > new Date(fechaExpiracion)) {
        setError('El código ha expirado. Volvé a iniciar sesión.')
        setLoading(false)
        setStep('credentials')
        return
      }

      // 3. Iniciar sesión oficialmente con Supabase Auth (esto setea las cookies automáticamente)
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError || !data?.session) {
        setError('Error al iniciar sesión final. Verificá tus datos.')
        setLoading(false)
        setStep('credentials')
        return
      }

      // 4. Limpiar el código usado de la base de datos
      await supabase.from('codigos_admin').delete().eq('email', email)

      // 5. Refrescar el estado del servidor para que el middleware lea la cookie nueva y redirigir
      router.refresh()
      window.location.href = '/admin'
    } catch (err: any) {
      setError(`Error al verificar: ${err.message || 'Desconocido'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-stone-200/80">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-widest text-stone-600 uppercase bg-stone-100 rounded-full">
            Panel Privado
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            Luminares Admin
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {step === 'credentials' 
              ? 'Ingresá tus datos para acceder al sistema' 
              : `Hemos enviado un código de 6 dígitos a ${email}`}
          </p>
        </div>

        {step === 'credentials' ? (
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none transition"
                  placeholder="admin@luminares.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Verificando y enviando código...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleVerifyCode}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Código de verificación (6 dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full text-center tracking-widest text-lg px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-stone-900 focus:outline-none transition"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Validando código...' : 'Ingresar al Panel'}
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-center text-xs text-stone-500 hover:text-stone-800 mt-2"
            >
              Volver atrás
            </button>
          </form>
        )}
      </div>
    </div>
  )
}