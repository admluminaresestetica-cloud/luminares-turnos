'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { UserCheck, Sparkles, CalendarDays, ShoppingBag, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Cliente configurado para manejar cookies de sesión en el navegador
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminHubPage() {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCerrandoSesion(true);

    try {
      // Al cerrar sesión aquí, @supabase/ssr borra la cookie del navegador
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Redirigimos directamente al login
        window.location.href = '/admin/login';
      }
    }
  };

  const modulos = [
    {
      titulo: 'Recepción',
      icono: UserCheck,
      ruta: '/admin/gestion/recepcion',
      bgHover: 'hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500',
      textColor: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300',
    },
    {
      titulo: 'Gabinete',
      icono: Sparkles,
      ruta: '/admin/gestion/gabinete',
      bgHover: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500',
      textColor: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
    },
    {
      titulo: 'Reservas',
      icono: CalendarDays,
      ruta: '/admin/turnos',
      bgHover: 'hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-500',
      textColor: 'group-hover:text-amber-700 dark:group-hover:text-amber-300',
    },
    {
      titulo: 'Tienda',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      bgHover: 'hover:bg-teal-50/60 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-800 hover:shadow-teal-500/10',
      iconBg: 'bg-teal-100/70 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500',
      textColor: 'group-hover:text-teal-700 dark:group-hover:text-teal-300',
    },
    {
      titulo: 'Ajustes',
      icono: Settings,
      ruta: '/admin/ajustes',
      bgHover: 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-slate-500/10',
      iconBg: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-hover:scale-110 group-hover:bg-slate-800 dark:group-hover:bg-zinc-200 group-hover:text-white dark:group-hover:text-zinc-900',
      textColor: 'group-hover:text-slate-800 dark:group-hover:text-zinc-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between p-6 sm:p-10 select-none transition-colors duration-200">

      {/* ENCABEZADO SUPERIOR CON BOTÓN DE CERRAR SESIÓN Y THEME TOGGLE */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">
              Luminares
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              Panel de gestión
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={cerrandoSesion}
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}</span>
        </button>
      </header>

      {/* GRILLA DE BOTONES CUADRADOS */}
      <main className="w-full max-w-xl mx-auto my-auto py-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {modulos.map((modulo, index) => {
            const IconoComponente = modulo.icono;
            // Si es el último elemento en cantidad impar, centrarlo si se desea o dejar en su lugar natural
            const esUltimoImpar = index === modulos.length - 1 && modulos.length % 2 !== 0;

            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                className={`group flex flex-col items-center justify-center p-6 sm:p-8 aspect-square bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-sm transition-all duration-200 active:scale-95 hover:-translate-y-1 ${
                  modulo.bgHover
                } ${esUltimoImpar ? 'col-span-2 sm:col-span-1 sm:col-start-1' : ''}`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner mb-3 sm:mb-4 ${modulo.iconBg}`}
                >
                  <IconoComponente className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-105" strokeWidth={1.8} />
                </div>

                <span className={`text-sm sm:text-base font-bold text-slate-700 dark:text-zinc-200 transition-colors tracking-tight ${modulo.textColor}`}>
                  {modulo.titulo}
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="w-full max-w-xl mx-auto text-center">
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          Seleccioná un módulo para operar
        </span>
      </footer>

    </div>
  );
}