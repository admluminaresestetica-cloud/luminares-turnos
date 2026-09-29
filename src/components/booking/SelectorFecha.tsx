'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

export default function SelectorFecha({
  tipo,
  fechasLaser,
  diasSemana,
  fechaSeleccionada,
  onSelect,
}: Props) {
  const hoy = useMemo(() => new Date(), []);
  const [mesOffset, setMesOffset] = useState(0);

  const { year, month, celdas } = useMemo(() => {
    const base = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    const startPad = getIsoWeekday(primerDia) - 1;
    const celdas: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) celdas.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      celdas.push(new Date(year, month, d));
    }

    return { year, month, celdas };
  }, [hoy, mesOffset]);

  return (
    <Card className="bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-none animate-in fade-in duration-300">
      {/* Cabecera del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMesOffset((m) => m - 1)}
          disabled={mesOffset === 0}
          className="h-8 w-8 rounded-xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 disabled:opacity-30 shadow-2xs transition-all cursor-pointer"
          aria-label="Mes anterior"
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
          className="h-8 w-8 rounded-xl border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 shadow-2xs transition-all cursor-pointer"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-slate-400 dark:text-zinc-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas del mes */}
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
              onClick={() => onSelect(iso)}
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
              
              {/* Indicador sutil para el día de HOY si no está seleccionado */}
              {esHoy && !seleccionada && (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de servicio Láser */}
      {tipo === 'laser' && fechasLaser.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800 flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--primary))]" />
          <span>Días destacados disponibles exclusivamente para la jornada láser.</span>
        </div>
      )}
    </Card>
  );
}