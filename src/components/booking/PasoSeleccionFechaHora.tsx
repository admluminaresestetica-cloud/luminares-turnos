'use client';

import { useMemo } from 'react';
import { Calendar, Clock, CircleDollarSign, ChevronRight } from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TipoServicio } from '@/lib/types';
import type { SlotDisponibilidad } from '@/lib/calendario/slots';

interface Props {
  tipo: TipoServicio;
  fechasLaser: string[];
  diasSemana: number[];
  fecha: string | null;
  hora: string | null;
  slots: SlotDisponibilidad[];
  cargandoSlots: boolean;
  precioTotal: number;
  duracionTotal: number;
  buttonStyle?: string;
  summaryBgStyle?: string;
  onSelectFecha: (f: string | null) => void;
  onSelectHora: (h: string | null) => void;
  onContinuar: () => void;
}

/**
 * Altura de la barra de navegación inferior.
 * Si tu bottom-nav mide distinto, definí --bottom-nav-height en tu layout
 * (por ejemplo: style={{ '--bottom-nav-height': '4.5rem' }}). Por defecto: 5rem.
 */
const OFFSET_NAV =
  'bottom-[calc(var(--bottom-nav-height,5rem)+env(safe-area-inset-bottom,0px)+0.75rem)]';

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
  const resumenTurno = useMemo(() => {
    if (!fecha) return null;
    const texto = new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return hora ? `${texto}, ${hora} hs` : texto;
  }, [fecha, hora]);

  return (
    <div className="relative space-y-10 pb-56 animate-in fade-in duration-300">
      {/* Sección Fecha */}
      <section className="space-y-5">
        <div className="flex items-center gap-3.5">
          <Badge
            variant="outline"
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-2xs text-slate-700 dark:text-zinc-200"
          >
            <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
          </Badge>
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
              Elegí la fecha
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Seleccioná el día de tu turno
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
        <section className="space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3.5">
            <Badge
              variant="outline"
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-2xs text-slate-700 dark:text-zinc-200"
            >
              <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
            </Badge>
            <div className="space-y-0.5">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
                Elegí el horario
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                Horarios disponibles para ese día
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

      {/* Footer flotante: tarjeta separada del bottom-nav con margen de seguridad */}
      <div
        className={`fixed ${OFFSET_NAV} left-4 right-4 z-40 mx-auto max-w-md sm:max-w-xl`}
      >
        <div
          className={`rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-5 shadow-2xl ${
            summaryBgStyle || ''
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-zinc-400">
                  <CircleDollarSign className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" />
                  <span>Total estimado</span>
                </div>
                {resumenTurno && (
                  <p className="truncate text-xs font-medium capitalize text-slate-400 dark:text-zinc-500">
                    {resumenTurno}
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-2 text-right shrink-0">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50 tabular-nums">
                  ${precioTotal.toLocaleString('es-AR')}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                  {duracionTotal} min
                </span>
              </div>
            </div>

            <Button
              type="button"
              disabled={!fecha || !hora}
              onClick={onContinuar}
              className={`w-full h-14 rounded-2xl text-base font-extrabold shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                buttonStyle ||
                'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-40'
              }`}
            >
              <span>Continuar a confirmación</span>
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
