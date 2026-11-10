'use client';

import { Clock, Loader2, AlertCircle, Check, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SlotDisponibilidad } from '@/lib/calendario/slots';

interface Props {
  slots: SlotDisponibilidad[];
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
      <Card className="bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 rounded-[24px] p-6 sm:p-8 flex flex-col items-center justify-center gap-2.5 shadow-none animate-in fade-in duration-200">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          Buscando horarios disponibles...
        </p>
      </Card>
    );
  }

  const slotsValidos = slots.filter((s) => s.estado !== 'ocupado');

  if (slotsValidos.length === 0) {
    return (
      <Alert className="bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 rounded-[24px] p-4 animate-in fade-in duration-200">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <AlertDescription className="text-xs font-medium leading-relaxed ml-2 text-amber-900 dark:text-amber-200">
          No hay horarios disponibles para la fecha seleccionada. Por favor, elegí otro día en el calendario.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    /* 📱 ESTRUCTURA DE 2 COLUMNAS ANCHAS EN MÓVIL */
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 animate-in fade-in duration-300">
      {slotsValidos.map(({ hora, estado }) => {
        const activa = horaSeleccionada === hora;
        const enProceso = estado === 'en_proceso';

        return (
          <Button
            key={hora}
            type="button"
            variant="outline"
            disabled={enProceso}
            onClick={() => !enProceso && onSelect(hora)}
            className={`
              h-auto py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all duration-200 flex items-center justify-between gap-2 shadow-2xs
              ${
                enProceso
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 opacity-90 cursor-not-allowed shadow-none'
                  : activa
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-md ring-2 ring-[hsl(var(--primary))]/20 active:scale-95 cursor-pointer'
                  : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 hover:border-[hsl(var(--primary))]/40 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 cursor-pointer'
              }
            `}
            title={enProceso ? 'Horario en proceso de pago por otro usuario' : undefined}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-black tracking-tight">{hora}</span>
              {enProceso && (
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  En proceso
                </span>
              )}
            </div>

            {enProceso ? (
              <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : activa ? (
              <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-zinc-500 opacity-60" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
