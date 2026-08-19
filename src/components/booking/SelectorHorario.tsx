'use client';

import { Clock, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  slots: string[];
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  cargando?: boolean;
}

export default function SelectorHorario({ slots, horaSeleccionada, onSelect, cargando }: Props) {
  if (cargando) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-8 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
        <p className="text-xs font-medium text-slate-500">Calculando horarios disponibles...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-amber-900 leading-relaxed">
          No hay turnos disponibles para esta fecha con la duración seleccionada. Por favor, elegí otro día.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((hora) => {
        const activa = horaSeleccionada === hora;
        return (
          <button
            key={hora}
            type="button"
            onClick={() => onSelect(hora)}
            className={`
              py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1.5
              ${activa
                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-900 hover:bg-slate-50 shadow-2xs'
              }
            `}
          >
            <Clock className={`w-3.5 h-3.5 ${activa ? 'text-white' : 'text-slate-400'}`} />
            <span>{hora}</span>
          </button>
        );
      })}
    </div>
  );
}