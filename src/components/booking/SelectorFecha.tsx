'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
    <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-3 sm:p-5">
      {/* Cabecera del Calendario */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          type="button"
          onClick={() => setMesOffset((m) => m - 1)}
          disabled={mesOffset === 0}
          className="p-2 sm:p-1.5 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
          {MESES[month]} {year}
        </h3>

        <button
          type="button"
          onClick={() => setMesOffset((m) => m + 1)}
          className="p-2 sm:p-1.5 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1.5 sm:mb-2">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-[11px] font-bold text-slate-400 py-0.5 sm:py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas del mes */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
                relative aspect-square rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center active:scale-95
                ${seleccionada
                  ? 'bg-slate-900 text-white shadow-md scale-105 z-10'
                  : habilitada
                    ? 'bg-white border border-slate-200/80 text-slate-800 hover:border-slate-900 hover:bg-slate-50 shadow-2xs'
                    : 'bg-slate-100/50 text-slate-300 border border-transparent cursor-not-allowed'
                }
              `}
            >
              <span>{fecha.getDate()}</span>
              
              {/* Indicador sutil para el día de HOY si no está seleccionado */}
              {esHoy && !seleccionada && (
                <span className="absolute bottom-1 sm:bottom-1.5 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de servicio Láser */}
      {tipo === 'laser' && fechasLaser.length > 0 && (
        <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Fechas exclusivas para la jornada de depilación láser.</span>
        </div>
      )}
    </div>
  );
}