import Link from 'next/link';
import { Zap, Sparkles, Calendar, ChevronRight } from 'lucide-react';

const ACCESOS = [
  {
    href: '/laser',
    titulo: 'Depilación Láser',
    descripcion: 'Elegí género, promos o zonas individuales. Descuentos automáticos y agenda inteligente.',
    icon: Zap,
  },
  {
    href: '/servicios',
    titulo: 'Servicios Generales',
    descripcion: 'Faciales, uñas y masajes. Elegí categoría y subtipo.',
    icon: Sparkles,
  },
  {
    href: '/mis-turnos',
    titulo: 'Mis Turnos',
    descripcion: 'Consultá, cancelá o reprogramá con tu celular y código de reserva.',
    icon: Calendar,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-lg w-full">
        <header className="text-center mb-10">
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-2">
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
    LUMINARES ESTÉTICA
  </span>
</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Reservá tu turno
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Elegí el servicio que necesitás y confirmá en minutos.
          </p>
        </header>

        <nav className="flex flex-col gap-4">
          {ACCESOS.map((acceso) => {
            const Icon = acceso.icon;
            return (
              <Link
                key={acceso.href}
                href={acceso.href}
                className="group flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-slate-400 hover:shadow-md transition-all duration-200"
              >
                {/* Contenedor del ícono minimalista */}
                <div className="w-12 h-12 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">
                    {acceso.titulo}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    {acceso.descripcion}
                  </p>
                </div>

                {/* Flecha discreta */}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </Link>
            );
          })}
        </nav>

        <p className="text-center text-xs text-slate-400 mt-10">
          Sin registro · Confirmación por WhatsApp
        </p>
      </div>
    </main>
  );
}
