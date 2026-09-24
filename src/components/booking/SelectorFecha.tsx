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
  colorAccent?: 'violet' | 'indigo' | 'rose' | 'emerald';
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const ACCENT_STYLES = {
  violet: {
    enabled: 'bg-violet-50 text-violet-700 hover:bg-violet-100/80 border border-violet-200/80',
    selected: 'bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-105 z-10 ring-2 ring-violet-500/30',
    dot: 'bg-violet-500',
    icon: 'text-violet-600',
  },
  indigo: {
    enabled: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200/80',
    selected: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105 z-10 ring-2 ring-indigo-500/30',
    dot: 'bg-indigo-500',
    icon: 'text-indigo-600',
  },
  rose: {
    enabled: 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-200/80',
    selected: 'bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-105 z-10 ring-2 ring-rose-500/30',
    dot: 'bg-rose-500',
    icon: 'text-rose-600',
  },
  emerald: {
    enabled: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/80',
    selected: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105 z-10 ring-2 ring-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-600',
  },
};

export default function SelectorFecha({
  tipo,
  fechasLaser,
  diasSemana,
  fechaSeleccionada,
  onSelect,
  colorAccent = 'emerald',
}: Props) {
  const hoy = useMemo(() => new Date(), []);
  const [mesOffset, setMesOffset] = useState(0);
  const styles = ACCENT_STYLES[colorAccent] || ACCENT_STYLES.emerald;

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
    <Card className="bg-slate-50/70 border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-none animate-in fade-in duration-300">
      {/* Cabecera del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMesOffset((m) => m - 1)}
          disabled={mesOffset === 0}
          className="h-8 w-8 rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-30 shadow-2xs transition-all cursor-pointer"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="text-center">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            {MESES[month]} {year}
          </h3>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMesOffset((m) => m + 1)}
          className="h-8 w-8 rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-100 active:scale-95 shadow-2xs transition-all cursor-pointer"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1">
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
                relative aspect-square rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 flex flex-col items-center justify-center cursor-pointer active:scale-95
                ${
                  seleccionada
                    ? styles.selected
                    : habilitada
                    ? `${styles.enabled} cursor-pointer`
                    : 'bg-white/40 text-slate-300 border border-slate-100 cursor-not-allowed'
                }
              `}
            >
              <span>{fecha.getDate()}</span>
              
              {/* Indicador sutil para el día de HOY si no está seleccionado */}
              {esHoy && !seleccionada && (
                <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de servicio Láser */}
      {tipo === 'laser' && fechasLaser.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <Calendar className={`w-3.5 h-3.5 shrink-0 ${styles.icon}`} />
          <span>Días destacados disponibles exclusivamente para la jornada láser.</span>
        </div>
      )}
    </Card>
  );
}