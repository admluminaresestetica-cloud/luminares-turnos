import AdminChatWidget from './components/AdminChatWidget'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {/* Carga todas las subpáginas del admin (turnos, tienda, gestión, etc.) */}
      {children}

      {/* Widget Flotante de IA global para todo el Admin */}
      <AdminChatWidget />
    </div>
  )
}