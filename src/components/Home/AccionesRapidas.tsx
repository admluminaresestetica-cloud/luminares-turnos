'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="w-full">
      {/* Tarjeta Principal: Agendar Turno con mayor contraste para que parezca un botón interactivo */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-[#2a4035] dark:bg-zinc-900 text-white shadow-md hover:shadow-xl hover:bg-[#314c3f] transition-all active:scale-[0.99] flex justify-between items-center border border-[#446654]"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
            Reserva Online
          </span>
          <h4 className="text-base sm:text-lg font-black tracking-tight text-white">Agendar un Turno</h4>
          <p className="text-xs text-stone-200 font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        {/* Ícono destacado en un recuadro claro para que resalte como botón */}
        <div className="p-3.5 rounded-2xl bg-emerald-400 text-emerald-950 group-hover:scale-105 group-hover:bg-emerald-300 transition-all shadow-md shrink-0 z-10">
          <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Luz ambiental sutil de acento */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}
