'use client';

import { Clock, ArrowRight } from 'lucide-react';

interface Props {
  precio: number;
  duracion: number;
  puedeContinuar: boolean;
  onContinuar: () => void;
  detalle?: string;
}

export default function BarraFlotanteLaser({
  precio,
  duracion,
  puedeContinuar,
  onContinuar,
  detalle,
}: Props) {
  const visible = precio > 0 || duracion > 0;
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800 p-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight">
                ${precio.toLocaleString('es-AR')}
              </p>
              <span className="flex items-center gap-1 text-slate-400 text-xs font-medium shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {duracion} min
              </span>
            </div>
            {detalle && (
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate font-medium">
                {detalle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onContinuar}
            disabled={!puedeContinuar}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm shadow-sm"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}