'use client';

import { Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
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
  buttonStyle: string;
  summaryBgStyle: string;
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
    <div className="space-y-5 sm:space-y-6">
      <section>
        <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
          <Calendar className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Elegí la fecha
          </h2>
        </div>
        <SelectorFecha
          tipo={tipo}
          fechasLaser={fechasLaser}
          diasSemana={diasSemana}
          fechaSeleccionada={fecha}
          onSelect={onSelectFecha}
        />
      </section>

      {fecha && (
        <section className="animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3">
            <Clock className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Elegí el horario
            </h2>
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
      <div className={`border rounded-xl p-3.5 sm:p-4 flex justify-between items-center transition-colors ${summaryBgStyle}`}>
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
          <span>Resumen</span>
        </div>
        <div className="text-right">
          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
            ${precioTotal.toLocaleString('es-AR')}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium ml-1.5 sm:ml-2">
            ({duracionTotal} min)
          </span>
        </div>
      </div>

      {/* Botón Siguiente */}
      <button
        type="button"
        disabled={!fecha || !hora}
        onClick={onContinuar}
        className={`w-full font-bold py-3.5 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 ${buttonStyle}`}
      >
        <span>Continuar a confirmación</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}