'use client' // <-- Lo convertimos en Client Component para poder leer la ruta

import { usePathname } from 'next/navigation'
import AdminChatWidget from './components/AdminChatWidget'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  return (
    <div className="relative min-h-screen">
      {/* Carga todas las subpáginas del admin */}
      {children}

      {/* Widget Flotante de IA: Se muestra SOLO si NO estamos en el login */}
      {!isLogin && <AdminChatWidget />}
    </div>
  )
}