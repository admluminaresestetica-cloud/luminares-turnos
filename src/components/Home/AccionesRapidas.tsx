'use client';

import Link from 'next/link';
import { CalendarCheck, ShoppingBag, ArrowUpRight } from 'lucide-react';

export default function AccionesRapidas() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        ¿Qué deseas hacer?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tarjeta 1: Agendar Turno */}
        <Link
          href="/laser"
          className="group relative overflow-hidden p-5 rounded-3xl bg-slate-900 dark:bg-zinc-900 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex justify-between items-center"
        >
          <div className="space-y-1 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Reserva Online
            </span>
            <h4 className="text-base font-black">Agendar un Turno</h4>
            <p className="text-xs text-slate-300 font-medium">
              Elegí tu tratamiento, fecha y horario.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors shrink-0 z-10">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
          </div>

          {/* Decoración de fondo */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </Link>

        {/* Tarjeta 2: Explorar Tienda */}
        <Link
          href="/tienda"
          className="group relative overflow-hidden p-5 rounded-3xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-slate-900 dark:text-zinc-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex justify-between items-center"
        >
          <div className="space-y-1 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Productos & Stock
            </span>
            <h4 className="text-base font-black">Comprar en la Tienda</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Cremas, sérums y cuidado personal.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-200 dark:bg-zinc-700 group-hover:bg-slate-300 dark:group-hover:bg-zinc-600 transition-colors shrink-0 z-10">
            <ShoppingBag className="w-6 h-6 text-slate-700 dark:text-zinc-200" />
          </div>
        </Link>
      </div>
    </div>
  );
}
