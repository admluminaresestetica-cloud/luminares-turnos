'use client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {/* Carga todas las subpáginas del admin */}
      {children}
    </div>
  )
}
