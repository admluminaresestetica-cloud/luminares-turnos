'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="w-full">
      {/* Tarjeta Principal: Agendar Turno integrada arriba */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-[#233326] dark:bg-zinc-900 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex justify-between items-center border border-[#3b533f]/40"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#a3be8c] bg-[#a3be8c]/15 px-2.5 py-0.5 rounded-full border border-[#a3be8c]/20">
            Reserva Online
          </span>
          <h4 className="text-base sm:text-lg font-black tracking-tight">Agendar un Turno</h4>
          <p className="text-xs text-stone-300 font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#a3be8c]/15 group-hover:bg-[#a3be8c]/25 transition-colors shrink-0 z-10 text-[#a3be8c]">
          <CalendarCheck className="w-6 h-6" />
        </div>

        {/* Luz ambiental sutil con tono de la paleta */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#a3be8c]/10 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}
