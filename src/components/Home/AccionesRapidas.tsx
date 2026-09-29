'use client';

import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="w-full">
      {/* Tarjeta Principal: Agendar Turno (Se oscurece un 15% automáticamente del color global) */}
      <Link
        href="/laser"
        className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-[hsl(var(--primary))] brightness-85 hover:brightness-75 text-[hsl(var(--primary-foreground))] shadow-md hover:shadow-xl transition-all active:scale-[0.99] flex justify-between items-center border border-white/10"
      >
        <div className="space-y-1 z-10">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary-foreground))] bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-md">
            Reserva Online
          </span>
          <h4 className="text-base sm:text-lg font-black tracking-tight text-[hsl(var(--primary-foreground))]">
            Agendar un Turno
          </h4>
          <p className="text-xs text-[hsl(var(--primary-foreground))/0.9] font-medium">
            Elegí tu tratamiento, fecha y horario.
          </p>
        </div>

        {/* Ícono destacado */}
        <div className="p-3.5 rounded-2xl bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] group-hover:scale-105 transition-all shadow-md shrink-0 z-10">
          <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Luz ambiental sutil de acento */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </Link>
    </div>
  );
}