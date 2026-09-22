'use client';

import { Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react';
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
      {/* Sección Fecha */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="p-1.5 rounded-lg bg-slate-50 border-slate-200">
            <Calendar className="w-4 h-4 text-slate-700" />
          </Badge>
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

      {/* Sección Horario */}
      {fecha && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="p-1.5 rounded-lg bg-slate-50 border-slate-200">
              <Clock className="w-4 h-4 text-slate-700" />
            </Badge>
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

      {/* Resumen Total con Card de Shadcn */}
      <Card className={`p-4 border shadow-sm transition-colors ${summaryBgStyle}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
            <span>Resumen</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
              ${precioTotal.toLocaleString('es-AR')}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium ml-2">
              ({duracionTotal} min)
            </span>
          </div>
        </div>
      </Card>

      {/* Botón Siguiente con Button de Shadcn */}
      <Button
        type="button"
        disabled={!fecha || !hora}
        onClick={onContinuar}
        className={`w-full h-12 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] ${buttonStyle}`}
      >
        <span>Continuar a confirmación</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}