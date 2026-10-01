'use client';

import { useState } from 'react';
import { Clock, Loader2, AlertCircle, Check, Sun, Sunrise, Sunset } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  slots: string[];
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  cargando?: boolean;
}

type FranjaHoraria = 'todos' | 'manana' | 'tarde' | 'noche';

export default function SelectorHorario({
  slots,
  horaSeleccionada,
  onSelect,
  cargando,
}: Props) {
  const [franja, setFranja] = useState<FranjaHoraria>('todos');

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

  // Filtrado de slots según la franja horaria seleccionada
  const slotsFiltrados = slots.filter((hora) => {
    if (franja === 'todos') return true;
    const horaNum = parseInt(hora.split(':')[0], 10);
    if (isNaN(horaNum)) return true;

    if (franja === 'manana') return horaNum < 13;
    if (franja === 'tarde') return horaNum >= 13 && horaNum < 18;
    if (franja === 'noche') return horaNum >= 18;
    return true;
  });

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Filtros por Franja Horaria (Chips) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setFranja('todos')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            franja === 'todos'
              ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
          }`}
        >
          Todos ({slots.length})
        </button>
        <button
          type="button"
          onClick={() => setFranja('manana')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            franja === 'manana'
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
          }`}
        >
          <Sunrise className="w-3.5 h-3.5" /> Mañana
        </button>
        <button
          type="button"
          onClick={() => setFranja('tarde')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            franja === 'tarde'
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
          }`}
        >
          <Sun className="w-3.5 h-3.5" /> Tarde
        </button>
        <button
          type="button"
          onClick={() => setFranja('noche')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            franja === 'noche'
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
          }`}
        >
          <Sunset className="w-3.5 h-3.5" /> Noche
        </button>
      </div>

      {/* Grilla de Slots */}
      {slotsFiltrados.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {slotsFiltrados.map((hora) => {
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
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-500 dark:text-zinc-400 text-xs font-medium">
          No hay turnos disponibles para esta franja horaria.
        </div>
      )}
    </div>
  );
}