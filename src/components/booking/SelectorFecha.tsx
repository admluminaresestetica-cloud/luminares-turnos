'use client';

import { useMemo, useState } from 'react';
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

const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function SelectorFecha({
  tipo,
  fechasLaser,
  diasSemana,
  fechaSeleccionada,
  onSelect,
}: Props) {
  const hoy = new Date();
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMesOffset((m) => m - 1)}
          disabled={mesOffset === 0}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <h3 className="font-semibold text-slate-800">
          {MESES[month]} {year}
        </h3>
        <button
          type="button"
          onClick={() => setMesOffset((m) => m + 1)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdas.map((fecha, i) => {
          if (!fecha) return <div key={`empty-${i}`} />;

          const iso = formatDateISO(fecha);
          const habilitada = isDateEnabled(fecha, tipo, fechasLaser, diasSemana);
          const seleccionada = fechaSeleccionada === iso;

          return (
            <button
              key={iso}
              type="button"
              disabled={!habilitada}
              onClick={() => onSelect(iso)}
              className={`
                aspect-square rounded-xl text-sm font-medium transition-colors
                ${seleccionada
                  ? 'bg-violet-600 text-white'
                  : habilitada
                    ? 'bg-white border border-slate-200 text-slate-800 hover:border-violet-300 hover:bg-violet-50'
                    : 'text-slate-300 cursor-not-allowed'
                }
              `}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>

      {tipo === 'laser' && fechasLaser.length > 0 && (
        <p className="text-xs text-slate-500 mt-3">
          Solo podés reservar en las fechas habilitadas para láser.
        </p>
      )}
    </div>
  );
}
