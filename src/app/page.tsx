import Link from 'next/link';

const ACCESOS = [
  {
    href: '/laser',
    titulo: 'Depilación Láser',
    descripcion: 'Elegí género, promos o zonas individuales. Descuentos automáticos y agenda inteligente.',
    emoji: '✨',
    color: 'hover:border-violet-300 hover:bg-violet-50/50',
  },
  {
    href: '/servicios',
    titulo: 'Servicios Generales',
    descripcion: 'Faciales, uñas y masajes. Elegí categoría y subtipo.',
    emoji: '💆',
    color: 'hover:border-rose-300 hover:bg-rose-50/50',
  },
  {
    href: '/mis-turnos',
    titulo: 'Mis Turnos',
    descripcion: 'Consultá, cancelá o reprogramá con tu celular y código de reserva.',
    emoji: '📋',
    color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-lg w-full">
        <header className="text-center mb-10">
          <p className="text-sm font-medium text-indigo-600 tracking-wide uppercase mb-2">
            Centro de Estética
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Reservá tu turno
          </h1>
          <p className="text-slate-500 mt-3 text-sm md:text-base">
            Elegí el servicio que necesitás y confirmá en minutos.
          </p>
        </header>

        <nav className="flex flex-col gap-4">
          {ACCESOS.map((acceso) => (
            <Link
              key={acceso.href}
              href={acceso.href}
              className={`group flex items-start gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all ${acceso.color}`}
            >
              <span className="text-2xl mt-0.5">{acceso.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {acceso.titulo}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {acceso.descripcion}
                </p>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-400 transition-colors mt-1">
                →
              </span>
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-slate-400 mt-10">
          Sin registro · Confirmación por WhatsApp
        </p>
      </div>
    </main>
  );
}
