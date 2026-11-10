'use client';

import { Loader2, AlertCircle, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-border bg-card p-10 shadow-xs animate-in fade-in duration-200">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Buscando horarios disponibles…
        </p>
      </div>
    );
  }

  // Filtrar o mostrar si no hay slots disponibles para reservar
  const slotsValidos = slots.filter((s) => s.estado !== 'ocupado');

  if (slotsValidos.length === 0) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-[24px] border border-border bg-card p-5 shadow-xs animate-in fade-in duration-200"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
        </span>
        <p className="pt-0.5 text-sm font-medium leading-relaxed text-muted-foreground">
          No hay horarios disponibles para la fecha seleccionada. Por favor, elegí otro día en el
          calendario.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-muted/50 p-3 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {slotsValidos.map(({ hora, estado }) => {
          const activa = horaSeleccionada === hora;
          const enProceso = estado === 'en_proceso';

          return (
            <Button
              key={hora}
              type="button"
              variant="outline"
              disabled={enProceso}
              aria-pressed={activa}
              onClick={() => !enProceso && onSelect(hora)}
              className={`
                h-14 w-full gap-2 rounded-2xl border text-base font-bold transition-all duration-200
                ${
                  enProceso
                    ? 'cursor-not-allowed border-dashed border-border bg-transparent text-muted-foreground opacity-80 shadow-none'
                    : activa
                    ? 'cursor-pointer border-primary bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground active:scale-95'
                    : 'cursor-pointer border-border bg-card text-foreground shadow-xs hover:border-primary/40 hover:bg-card active:scale-95'
                }
              `}
              title={enProceso ? 'Horario en proceso de pago por otro usuario' : undefined}
            >
              {enProceso ? (
                <Lock className="h-4 w-4 shrink-0" />
              ) : activa ? (
                <Check className="h-4 w-4 shrink-0 stroke-[2.5]" />
              ) : null}
              <span className="flex flex-col items-center leading-tight">
                <span className="tabular-nums">{hora}</span>
                {enProceso && (
                  <span className="text-[10px] font-semibold text-muted-foreground">En proceso</span>
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
