'use client'

import { useRouter } from 'next/navigation'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'
import { CalendarIcon, ShoppingBagIcon, LogOutIcon, ChevronRightIcon } from '@/components/admin/icons'

export default function AdminHubPage() {
  const router = useRouter()
  const handleLogout = useAdminLogout()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Resplandor decorativo, muy sutil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Encabezado */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Panel de administración
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Luminares</h1>
            <p className="mt-2 text-[15px] text-slate-500">Elegí qué querés gestionar hoy</p>
          </div>

          {/* Tarjetas de navegación */}
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/admin/reservas')}
              className="
                group flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white
                p-5 text-left shadow-sm transition-all duration-200
                hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-lg
                active:translate-y-0 active:scale-[0.98] active:shadow-sm
              "
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-slate-900">Agenda y Turnos</span>
                <span className="block text-sm text-slate-500">Reservas, estados y cobros</span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-teal-500" />
            </button>

            <button
              onClick={() => router.push('/admin/tienda')}
              className="
                group flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white
                p-5 text-left shadow-sm transition-all duration-200
                hover:-translate-y-0.5 hover:border-rose-100 hover:shadow-lg
                active:translate-y-0 active:scale-[0.98] active:shadow-sm
              "
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <ShoppingBagIcon className="h-6 w-6" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-slate-900">Tienda y Productos</span>
                <span className="block text-sm text-slate-500">Precios, promos, horarios y más</span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-rose-500" />
            </button>
          </nav>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="mx-auto mt-8 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-700"
          >
            <LogOutIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
