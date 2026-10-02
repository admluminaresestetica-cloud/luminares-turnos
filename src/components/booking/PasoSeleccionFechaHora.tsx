'use client';

import { Calendar, Clock, Banknote, ChevronRight } from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TipoServicio } from '@/lib/types';

interface Props {
  tipo: TipoServicio;
  fechasLaser: string[];
  diasSemana: number[];
  fecha: string | null;
  hora: string | null;
  slots: string[];
  cargandoSlots: boolean;
  precioTotal: number;
  duracionTotal: number;
  buttonStyle?: string;
  summaryBgStyle?: string;
  onSelectFecha: (f: string | null) => void;
  onSelectHora: (h: string | null) => void;
  onContinuar: () => void;
}

export default function PasoSeleccionFechaHora({
  tipo,
  fechasLaser,
  diasSemana,
  fecha,
  hora,
  slots,
  cargandoSlots,
  precioTotal,
  duracionTotal,
  buttonStyle,
  summaryBgStyle,
  onSelectFecha,
  onSelectHora,
  onContinuar,
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sección Fecha */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-zinc-700 shadow-2xs text-slate-700 dark:text-zinc-200"
          >
            <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
          </Badge>
          <div>
            <h2 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
              Elegí la fecha
            </h2>
            <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-400">
              Selecciona el día de tu turno
            </p>
          </div>
        </div>

        <SelectorFecha
          tipo={tipo}
          fechasLaser={fechasLaser}
          diasSemana={diasSemana}
          fechaSeleccionada={fecha}
          onSelect={onSelectFecha}
        />
      </section>

      {/* Sección Horario */}
      {fecha && (
        <section className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-zinc-700 shadow-2xs text-slate-700 dark:text-zinc-200"
            >
              <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
            </Badge>
            <div>
              <h2 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
                Elegí el horario
              </h2>
              <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-400">
                Horarios disponibles para la fecha seleccionada
              </p>
            </div>
          </div>

          <SelectorHorario
            slots={slots}
            horaSeleccionada={hora}
            onSelect={onSelectHora}
            cargando={cargandoSlots}
          />
        </section>
      )}

      {/* Resumen Total */}
      <Card
        className={`p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs transition-all duration-300 ${
          summaryBgStyle || 'bg-slate-50/70 dark:bg-zinc-900/60'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-bold">
            <Banknote className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" />
            <span>Total estimado</span>
          </div>
          <div className="text-right flex items-baseline gap-1.5">
            <span className="font-black text-slate-900 dark:text-zinc-100 text-lg sm:text-xl tracking-tight">
              ${precioTotal.toLocaleString('es-AR')}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
              ({duracionTotal} min)
            </span>
          </div>
        </div>
      </Card>

      {/* Botón Siguiente */}
      <Button
        type="button"
        disabled={!fecha || !hora}
        onClick={onContinuar}
        className={`w-full h-12 font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
          buttonStyle ||
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-40'
        }`}
      >
        <span>Continuar a confirmación</span>
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </Button>
    </div>
  );
}