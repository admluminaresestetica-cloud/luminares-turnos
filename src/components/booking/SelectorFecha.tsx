'use client';

import { useMemo, useState, useRef } from 'react';
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          {fechaSeleccionada 
            ? new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
            : MESES[hoy.getMonth()] + ' ' + hoy.getFullYear()}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMostrarCalendarioCompleto(!mostrarCalendarioCompleto)}
          className="text-xs font-extrabold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-xl h-8 gap-1.5 cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{mostrarCalendarioCompleto ? 'Ver carrusel' : 'Ver mes'}</span>
        </Button>
      </div>

      {!mostrarCalendarioCompleto ? (
        /* CARRUSEL DE DÍAS AMPLIADO Y CÓMODO */
        <div 
          ref={scrollRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x touch-pan-x"
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
                disabled={!habilitada}
                onClick={() => onSelect(iso)}
                className={`
                  snap-start shrink-0 w-18 h-22 rounded-[22px] flex flex-col items-center justify-center transition-all duration-200 active:scale-95 border cursor-pointer shadow-2xs
                  ${
                    seleccionada
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-md scale-105 z-10 ring-2 ring-[hsl(var(--primary))]/30'
                      : habilitada
                      ? 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-800 hover:border-[hsl(var(--primary))]/40 hover:bg-slate-50 dark:hover:bg-zinc-800'
                      : 'bg-slate-100/50 dark:bg-zinc-800/30 text-slate-300 dark:text-zinc-700 border-slate-100 dark:border-zinc-800/40 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <span className={`text-[11px] font-extrabold uppercase tracking-tight ${seleccionada ? 'opacity-90' : 'text-slate-400 dark:text-zinc-400'}`}>
                  {esHoy ? 'Hoy' : nombreDia}
                </span>
                <span className="text-xl font-black leading-tight mt-1">
                  {fecha.getDate()}
                </span>
                {esHoy && !seleccionada && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 rounded-[24px] p-4 sm:p-5 shadow-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m - 1)}
              disabled={mesOffset === 0}
              className="h-8 w-8 rounded-xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                {MESES[month]} {year}
              </h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m + 1)}
              className="h-8 w-8 rounded-xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_CORTOS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 dark:text-zinc-500 py-1">
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
                    relative aspect-square rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 flex flex-col items-center justify-center active:scale-95
                    ${
                      seleccionada
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md scale-105 z-10 ring-2 ring-[hsl(var(--primary))]/30'
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
        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--primary))]" />
          <span>Días destacados disponibles exclusivamente para la jornada láser.</span>
        </div>
      )}
    </div>
  );
}
