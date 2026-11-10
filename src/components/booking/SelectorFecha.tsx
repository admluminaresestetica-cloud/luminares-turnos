'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  formatDateISO,
  getIsoWeekday,
  isDateEnabled,
} from '@/lib/calendario/slots';

interface Props {
  tipo: 'laser' | 'general';
  fechasLaser: string[];
  diasSemana: number[];
  fechaSeleccionada: string | null;
  onSelect: (fecha: string) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const DIAS_LETRAS_CORTAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function SelectorFecha({
  tipo,
  fechasLaser,
  diasSemana,
  fechaSeleccionada,
  onSelect,
}: Props) {
  const hoy = useMemo(() => new Date(), []);
  const [mesOffset, setMesOffset] = useState(0);
  const [mostrarCalendarioCompleto, setMostrarCalendarioCompleto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const diasCarrusel = useMemo(() => {
    const lista = [];
    const base = new Date(hoy);
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      lista.push(d);
    }
    return lista;
  }, [hoy]);

  const { year, month, celdas } = useMemo(() => {
    const base = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
    const y = base.getFullYear();
    const m = base.getMonth();
    const primerDia = new Date(y, m, 1);
    const ultimoDia = new Date(y, m + 1, 0);

    const startPad = getIsoWeekday(primerDia) - 1;
    const c: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) c.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      c.push(new Date(y, m, d));
    }

    return { year: y, month: m, celdas: c };
  }, [hoy, mesOffset]);

  // Mantiene visible la tarjeta seleccionada al volver al carrusel
  useEffect(() => {
    if (mostrarCalendarioCompleto || !fechaSeleccionada) return;
    const el = scrollRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [fechaSeleccionada, mostrarCalendarioCompleto]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-base font-bold capitalize tracking-tight text-slate-800 dark:text-zinc-100">
          {fechaSeleccionada
            ? new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
                month: 'long',
                year: 'numeric',
              })
            : MESES[hoy.getMonth()] + ' ' + hoy.getFullYear()}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMostrarCalendarioCompleto(!mostrarCalendarioCompleto)}
          className="h-10 gap-2 rounded-xl px-3.5 text-sm font-extrabold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 cursor-pointer"
        >
          <Grid className="w-4 h-4" />
          <span>{mostrarCalendarioCompleto ? 'Ver carrusel' : 'Ver mes'}</span>
        </Button>
      </div>

      {!mostrarCalendarioCompleto ? (
        /* Carrusel con sangrado lateral: las tarjetas llegan al borde de la pantalla */
        <div
          ref={scrollRef}
          className="-mx-4 flex items-center gap-3 overflow-x-auto px-4 py-3 scrollbar-none snap-x snap-mandatory touch-pan-x scroll-px-4"
        >
          {diasCarrusel.map((fecha) => {
            const iso = formatDateISO(fecha);
            const habilitada = isDateEnabled(fecha, tipo, fechasLaser, diasSemana);
            const seleccionada = fechaSeleccionada === iso;
            const esHoy = formatDateISO(hoy) === iso;
            const nombreDia = DIAS_LETRAS_CORTAS[fecha.getDay()];

            return (
              <button
                key={iso}
                type="button"
                data-selected={seleccionada}
                disabled={!habilitada}
                onClick={() => onSelect(iso)}
                className={`
                  relative snap-start shrink-0 w-20 h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 border transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs
                  ${
                    seleccionada
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-lg ring-4 ring-[hsl(var(--primary))]/20'
                      : habilitada
                      ? 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border-slate-200/80 dark:border-zinc-800 hover:border-[hsl(var(--primary))]/40 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      : 'bg-slate-100/50 dark:bg-zinc-800/30 text-slate-300 dark:text-zinc-700 border-slate-100 dark:border-zinc-800/40 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <span
                  className={`text-xs font-bold ${
                    seleccionada ? 'opacity-90' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {esHoy ? 'Hoy' : nombreDia}
                </span>
                <span className="text-3xl font-black leading-none tracking-tight tabular-nums">
                  {fecha.getDate()}
                </span>
                {esHoy && !seleccionada && (
                  <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m - 1)}
              disabled={mesOffset === 0}
              className="h-11 w-11 rounded-2xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {MESES[month]} {year}
            </h3>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m + 1)}
              className="h-11 w-11 rounded-2xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {DIAS_CORTOS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-bold text-slate-400 dark:text-zinc-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {celdas.map((fecha, i) => {
              if (!fecha) return <div key={`empty-${i}`} className="aspect-square" />;

              const iso = formatDateISO(fecha);
              const habilitada = isDateEnabled(fecha, tipo, fechasLaser, diasSemana);
              const seleccionada = fechaSeleccionada === iso;
              const esHoy = formatDateISO(hoy) === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!habilitada}
                  onClick={() => {
                    onSelect(iso);
                    setMostrarCalendarioCompleto(false);
                  }}
                  className={`
                    relative aspect-square rounded-2xl text-sm sm:text-base font-extrabold tabular-nums transition-all duration-150 flex flex-col items-center justify-center active:scale-95
                    ${
                      seleccionada
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md z-10 ring-4 ring-[hsl(var(--primary))]/20'
                        : habilitada
                        ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]/20 cursor-pointer'
                        : 'bg-white/40 dark:bg-zinc-800/30 text-slate-300 dark:text-zinc-700 border border-slate-100 dark:border-zinc-800/50 cursor-not-allowed'
                    }
                  `}
                >
                  <span>{fecha.getDate()}</span>
                  {esHoy && !seleccionada && (
                    <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {tipo === 'laser' && fechasLaser.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 px-4 py-3 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <CalendarIcon className="w-4 h-4 shrink-0 text-[hsl(var(--primary))]" />
          <span>Días destacados disponibles exclusivamente para la jornada láser.</span>
        </div>
      )}
    </div>
  );
}
