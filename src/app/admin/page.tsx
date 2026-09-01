'use client';

import Link from 'next/link';
import { UserCheck, Sparkles, CalendarDays, ShoppingBag, ArrowRight, LogOut } from 'lucide-react';

export default function AdminHubPage() {
  const modulos = [
    {
      titulo: 'Recepción',
      descripcion: 'Búsqueda de pacientes, check-in y anamnesis.',
      icono: UserCheck,
      ruta: '/admin/gestion/recepcion',
      iconWrap: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      hoverBorder: 'hover:border-indigo-200',
      hoverTitle: 'group-hover:text-indigo-700',
      linkColor: 'text-indigo-600',
    },
    {
      titulo: 'Gabinete',
      descripcion: 'Control técnico en vivo y sesiones láser.',
      icono: Sparkles,
      ruta: '/admin/gestion/gabinete',
      iconWrap: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      hoverBorder: 'hover:border-emerald-200',
      hoverTitle: 'group-hover:text-emerald-700',
      linkColor: 'text-emerald-600',
    },
    {
      titulo: 'Reservas',
      descripcion: 'Agenda, horarios y turnos de servicios.',
      icono: CalendarDays,
      ruta: '/admin/turnos',
      iconWrap: 'bg-amber-50 text-amber-600 border-amber-100',
      hoverBorder: 'hover:border-amber-200',
      hoverTitle: 'group-hover:text-amber-700',
      linkColor: 'text-amber-600',
    },
    {
      titulo: 'Tienda',
      descripcion: 'Stock, precios, categorías y pedidos.',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      iconWrap: 'bg-teal-50 text-teal-600 border-teal-100',
      hoverBorder: 'hover:border-teal-200',
      hoverTitle: 'group-hover:text-teal-700',
      linkColor: 'text-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">

        {/* ENCABEZADO */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
              Luminares
            </h1>
            <p className="text-xs text-slate-500">
              Panel de administración
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Volver al sitio</span>
          </Link>
        </div>

        {/* TÍTULO */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            ¿A dónde vamos hoy?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Elegí el módulo al que querés ingresar.
          </p>
        </div>

        {/* GRILLA DE MÓDULOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {modulos.map((modulo) => {
            const IconoComponente = modulo.icono;
            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 active:scale-95 active:translate-y-0 ${modulo.hoverBorder}`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${modulo.iconWrap}`}>
                    <IconoComponente className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className={`text-base font-semibold text-slate-800 transition-colors ${modulo.hoverTitle}`}>
                    {modulo.titulo}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {modulo.descripcion}
                  </p>
                </div>

                <div className={`mt-5 flex items-center text-xs font-semibold ${modulo.linkColor} group-hover:translate-x-1 transition-transform`}>
                  <span>Ingresar</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}