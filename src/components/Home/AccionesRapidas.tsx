'use client';

import Link from 'next/link';
import { CalendarCheck, ShoppingBag } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
        ¿Qué deseas hacer?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tarjeta 1: Agendar Turno - Verde Salvia Profundo / Orgánico */}
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

          <div className="p-3.5 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0 z-10 text-[#a3c9b8]">
            <CalendarCheck className="w-6 h-6" />
          </div>

          {/* Luz ambiental en verde menta suave */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#a3c9b8]/10 rounded-full blur-xl pointer-events-none" />
        </Link>

        {/* Tarjeta 2: Explorar Tienda - Arena / Marfil Suave */}
        <Link
          href="/tienda"
          className="group relative overflow-hidden p-5 rounded-3xl bg-[#f7f5f0] dark:bg-zinc-900/60 border border-[#e8e4d9] dark:border-zinc-800 text-stone-800 dark:text-zinc-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex justify-between items-center"
        >
          <div className="space-y-1 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-600 dark:text-zinc-400 bg-stone-200/70 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-stone-300/50 dark:border-zinc-700">
              Productos & Stock
            </span>
            <h4 className="text-base font-black tracking-tight">Comprar en la Tienda</h4>
            <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
              Cremas, sérums y cuidado personal.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-200/60 dark:bg-zinc-800 group-hover:bg-stone-300/60 transition-colors shrink-0 z-10 text-stone-700 dark:text-zinc-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>
      </div>
    </div>
  );
}
