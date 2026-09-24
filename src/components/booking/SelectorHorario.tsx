'use client';

import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  slots: string[];
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  cargando?: boolean;
}

export default function SelectorHorario({ slots, horaSeleccionada, onSelect, cargando }: Props) {
  if (cargando) {
    return (
      <Card className="bg-slate-50/50 border-slate-200/80 p-6 sm:p-8 flex flex-col items-center justify-center gap-2 shadow-xs">
        <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
        <p className="text-xs font-medium text-slate-500">Calculando horarios disponibles...</p>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Alert className="bg-amber-50/60 border-amber-200/80 text-amber-900 rounded-2xl p-3.5 sm:p-4">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <AlertDescription className="text-xs font-semibold leading-relaxed ml-2">
          No hay turnos disponibles para esta fecha con la duración seleccionada. Por favor, elegí otro día.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {slots.map((hora) => {
        const activa = horaSeleccionada === hora;
        return (
          <Button
            key={hora}
            type="button"
            variant={activa ? "default" : "outline"}
            onClick={() => onSelect(hora)}
            className={`
              h-auto py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95
              ${activa
                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-900 hover:bg-slate-50 shadow-2xs'
              }
            `}
          >
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${activa ? 'text-white' : 'text-slate-400'}`} />
            <span>{hora}</span>
          </Button>
        );
      })}
    </div>
  );
}