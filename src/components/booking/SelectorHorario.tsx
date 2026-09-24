'use client';

import { Clock, Loader2, AlertCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  slots: string[];
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  cargando?: boolean;
  colorAccent?: 'violet' | 'indigo' | 'rose' | 'emerald';
}

const ACCENT_STYLES = {
  violet: {
    active: 'bg-violet-600 text-white border-violet-600 shadow-xs shadow-violet-500/20 ring-2 ring-violet-500/20',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400',
  },
  indigo: {
    active: 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/20 ring-2 ring-indigo-500/20',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400',
  },
  rose: {
    active: 'bg-rose-600 text-white border-rose-600 shadow-xs shadow-rose-500/20 ring-2 ring-rose-500/20',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400',
  },
  emerald: {
    active: 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-500/20 ring-2 ring-emerald-500/20',
    iconActive: 'text-white',
    iconInactive: 'text-slate-400',
  },
};

export default function SelectorHorario({
  slots,
  horaSeleccionada,
  onSelect,
  cargando,
  colorAccent = 'emerald',
}: Props) {
  const styles = ACCENT_STYLES[colorAccent] || ACCENT_STYLES.emerald;

  if (cargando) {
    return (
      <Card className="bg-slate-50/70 border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2.5 shadow-none animate-in fade-in duration-200">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">
          Buscando horarios disponibles...
        </p>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Alert className="bg-amber-50/70 border-amber-200/80 text-amber-900 rounded-2xl p-4 animate-in fade-in duration-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <AlertDescription className="text-xs font-medium leading-relaxed ml-2 text-amber-900">
          No hay horarios disponibles para la fecha seleccionada. Por favor, elegí otro día en el calendario.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2.5 animate-in fade-in duration-300">
      {slots.map((hora) => {
        const activa = horaSeleccionada === hora;
        return (
          <Button
            key={hora}
            type="button"
            variant="outline"
            onClick={() => onSelect(hora)}
            className={`
              h-auto py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer
              ${
                activa
                  ? styles.active
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 hover:text-slate-900 shadow-2xs'
              }
            `}
          >
            {activa ? (
              <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )}
            <span>{hora}</span>
          </Button>
        );
      })}
    </div>
  );
}