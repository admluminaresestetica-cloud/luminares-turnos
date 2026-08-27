'use client'

import { useRouter } from 'next/navigation'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'

export default function AdminHubPage() {
  const router = useRouter()
  const handleLogout = useAdminLogout()

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Luminares</h1>
          <p className="text-sm text-neutral-500 mt-1">¿Qué querés gestionar hoy?</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/admin/reservas')}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md hover:border-neutral-300 active:scale-[0.98]"
          >
            <span className="text-3xl">📅</span>
            <div className="flex-1">
              <p className="text-base font-medium text-neutral-900">Agenda y Turnos</p>
              <p className="text-sm text-neutral-500">Reservas, estados y cobros</p>
            </div>
            <span className="text-neutral-300 group-hover:text-neutral-400 transition">→</span>
          </button>

          <button
            onClick={() => router.push('/admin/tienda')}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md hover:border-neutral-300 active:scale-[0.98]"
          >
            <span className="text-3xl">🛍️</span>
            <div className="flex-1">
              <p className="text-base font-medium text-neutral-900">Tienda y Productos</p>
              <p className="text-sm text-neutral-500">Precios, promos, horarios y más</p>
            </div>
            <span className="text-neutral-300 group-hover:text-neutral-400 transition">→</span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 transition self-center"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
