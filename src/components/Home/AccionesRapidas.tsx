'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        ¿Qué deseas hacer?
      </h3>

      {/* Solo Tarjeta Principal: Agendar Turno */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-5 rounded-3xl bg-[#1e2e28] dark:bg-zinc-900 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex justify-between items-center border border-[#2d4239]"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#a3c9b8] bg-[#a3c9b8]/15 px-2.5 py-0.5 rounded-full border border-[#a3c9b8]/20">
            Reserva Online
          </span>
          <h4 className="text-base font-black tracking-tight">Agendar un Turno</h4>
          <p className="text-xs text-stone-300 font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#a3c9b8]/15 group-hover:bg-[#a3c9b8]/25 transition-colors shrink-0 z-10 text-[#a3c9b8]">
          <CalendarCheck className="w-6 h-6" />
        </div>

        {/* Luz ambiental sutil */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#a3c9b8]/10 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}
