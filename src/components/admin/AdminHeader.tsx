// src/components/admin/AdminHeader.tsx
'use client'

interface AdminHeaderProps {
  onLogout: () => void
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Panel de Control</h1>
        <p className="text-xs text-gray-500">Gestión de Turnos y Estética</p>
      </div>
      <button
        onClick={onLogout}
        className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
      >
        Cerrar Sesión
      </button>
    </header>
  )
}