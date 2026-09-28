'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="w-full">
      {/* Tarjeta Principal: Agendar Turno con tonos rosa/mora */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-rose-950/40 dark:bg-zinc-900 text-white shadow-md hover:shadow-xl hover:bg-rose-950/60 transition-all active:scale-[0.99] flex justify-between items-center border border-rose-300/30 backdrop-blur-xs"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-100 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-400/30">
            Reserva Online
          </span>
          <h4 className="text-base sm:text-lg font-black tracking-tight text-white">Agendar un Turno</h4>
          <p className="text-xs text-rose-100/90 font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        {/* Ícono destacado en tono blanco/rosa para resaltar como botón */}
        <div className="p-3.5 rounded-2xl bg-white text-rose-600 group-hover:scale-105 group-hover:bg-rose-50 transition-all shadow-md shrink-0 z-10">
          <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Luz ambiental sutil de acento */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-400/20 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}