'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export default function AccionesRapidas() {
  const { config } = useConfig();

  return (
    <div className="w-full">
      {/* Tarjeta con efecto Glassmorphism que se adapta fluidamente al fondo general */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 text-white shadow-lg backdrop-blur-md transition-all active:scale-[0.99] flex justify-between items-center border border-white/20"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-md">
            Reserva Online
          </span>
          <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
            Agendar tu sesión láser
          </h4>
          <p className="text-xs text-white/90 font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        {/* Ícono destacado */}
        <div className="p-3.5 rounded-2xl bg-white text-slate-900 group-hover:scale-105 transition-all shadow-md shrink-0 z-10">
          <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Luz ambiental sutil de acento */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}