'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { UserCheck, Sparkles, CalendarDays, ShoppingBag, LogOut } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminHubPage() {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Usar window.location.href fuerza una recarga limpia y elimina cualquier caché de auth
      window.location.href = '/admin/login';
    }
  };

  const modulos = [
    {
      titulo: 'Recepción',
      icono: UserCheck,
      ruta: '/admin/gestion/recepcion',
      bgHover: 'hover:bg-indigo-50/60 hover:border-indigo-300 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-100/70 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white',
      textColor: 'group-hover:text-indigo-700',
    },
    {
      titulo: 'Gabinete',
      icono: Sparkles,
      ruta: '/admin/gestion/gabinete',
      bgHover: 'hover:bg-emerald-50/60 hover:border-emerald-300 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-100/70 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white',
      textColor: 'group-hover:text-emerald-700',
    },
    {
      titulo: 'Reservas',
      icono: CalendarDays,
      ruta: '/admin/turnos',
      bgHover: 'hover:bg-amber-50/60 hover:border-amber-300 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-100/70 text-amber-600 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white',
      textColor: 'group-hover:text-amber-700',
    },
    {
      titulo: 'Tienda',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      bgHover: 'hover:bg-teal-50/60 hover:border-teal-300 hover:shadow-teal-500/10',
      iconBg: 'bg-teal-100/70 text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white',
      textColor: 'group-hover:text-teal-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-10 select-none">

      {/* ENCABEZADO SUPERIOR CON BOTÓN DE CERRAR SESIÓN */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Luminares
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Panel de gestión
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={cerrandoSesion}
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-rose-200/80 hover:bg-rose-50 px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}</span>
        </button>
      </header>

      {/* GRILLA DE BOTONES CUADRADOS */}
      <main className="w-full max-w-xl mx-auto my-auto py-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {modulos.map((modulo) => {
            const IconoComponente = modulo.icono;
            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                className={`group flex flex-col items-center justify-center p-6 sm:p-8 aspect-square bg-white border border-slate-200/80 rounded-3xl shadow-sm transition-all duration-200 active:scale-95 hover:-translate-y-1 ${modulo.bgHover}`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner mb-3 sm:mb-4 ${modulo.iconBg}`}
                >
                  <IconoComponente className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105" strokeWidth={1.8} />
                </div>

                <span className={`text-sm sm:text-base font-bold text-slate-700 transition-colors tracking-tight ${modulo.textColor}`}>
                  {modulo.titulo}
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="w-full max-w-xl mx-auto text-center">
        <span className="text-[11px] text-slate-400 font-medium">
          Seleccioná un módulo para operar
        </span>
      </footer>

    </div>
  );
}