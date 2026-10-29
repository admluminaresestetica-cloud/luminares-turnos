'use client';

import { CheckCircle2 } from 'lucide-react';

export interface DatosReservaExitosa {
  codigo: string;
  detalle: string;
  fecha: string;
  hora: string;
}

interface Props {
  reservaExitosa: DatosReservaExitosa;
  onCerrar: () => void;
}

export default function ModalReservaExitosa({ reservaExitosa, onCerrar }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200/80 dark:border-zinc-800 relative overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        
        {/* Glow sutil de fondo adaptado al color primario */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[hsl(var(--primary))]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Badge de Confirmación */}
        <div className="w-14 h-14 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-2xl border border-[hsl(var(--primary))]/20 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          ¡Turno Reservado!
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 mb-4 font-medium flex items-center justify-center gap-1.5">
          <span>Código de reserva:</span>
          <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-100 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-lg text-xs">
            {reservaExitosa.codigo}
          </span>
        </p>
        
        {/* Detalle del servicio y fecha */}
        <div className="bg-slate-50/70 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 text-left space-y-2.5 mb-4 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-extrabold block mb-0.5">
              Servicio / Selección
            </span>
            <p className="text-xs text-slate-800 dark:text-zinc-200 font-bold leading-snug">
              {reservaExitosa.detalle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-extrabold block mb-0.5">
                Fecha
              </span>
              <p className="text-xs text-slate-800 dark:text-zinc-200 font-semibold">
                {reservaExitosa.fecha}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-extrabold block mb-0.5">
                Horario
              </span>
              <p className="text-xs text-slate-800 dark:text-zinc-200 font-semibold">
                {reservaExitosa.hora} hs
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4 font-medium leading-normal">
          Si fuiste redirigido a WhatsApp, asegurate de enviar el mensaje para finalizar la coordinación.
        </p>

        <button
          type="button"
          onClick={onCerrar}
          className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 active:scale-[0.98] font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer tracking-wide"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}