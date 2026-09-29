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
}

export default function SelectorHorario({
  slots,
  horaSeleccionada,
  onSelect,
  cargando,
}: Props) {
  if (cargando) {
    return (
      <Card className="bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2.5 shadow-none animate-in fade-in duration-200">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Buscando horarios disponibles...
        </p>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Alert className="bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 rounded-2xl p-4 animate-in fade-in duration-200">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <AlertDescription className="text-xs font-medium leading-relaxed ml-2 text-amber-900 dark:text-amber-200">
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
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-xs ring-2 ring-[hsl(var(--primary))]/20'
                  : 'bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-[hsl(var(--primary))]/40 hover:bg-slate-50/80 dark:hover:bg-zinc-700/80 shadow-2xs'
              }
            `}
          >
            {activa ? (
              <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-zinc-400 transition-colors" />
            )}
            <span>{hora}</span>
          </Button>
        );
      })}
    </div>
  );
}