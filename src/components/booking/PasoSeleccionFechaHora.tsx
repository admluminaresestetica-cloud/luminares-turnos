'use client';

import { Calendar, Clock, ChevronRight } from 'lucide-react';
import SelectorFecha from '@/components/booking/SelectorFecha';
import SelectorHorario from '@/components/booking/SelectorHorario';
import { Button } from '@/components/ui/button';
import type { TipoServicio } from '@/lib/types';
import type { SlotDisponibilidad } from '@/lib/calendario/slots';

interface Props {
  tipo: TipoServicio;
  fechasLaser: string[];
  diasSemana: number[];
  fecha: string | null;
  hora: string | null;
  slots: SlotDisponibilidad[]; // <-- Actualizado con el tipo con estado
  cargandoSlots: boolean;
  precioTotal: number;
  duracionTotal: number;
  buttonStyle?: string;
  summaryBgStyle?: string;
  onSelectFecha: (f: string | null) => void;
  onSelectHora: (h: string | null) => void;
  onContinuar: () => void;
}

function TituloSeccion({
  Icono,
  titulo,
  detalle,
}: {
  Icono: typeof Calendar;
  titulo: string;
  detalle: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icono className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold leading-tight tracking-tight text-foreground">
          {titulo}
        </h2>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{detalle}</p>
      </div>
    </div>
  );
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sección Fecha */}
      <section className="space-y-4">
        <TituloSeccion
          Icono={Calendar}
          titulo="Elegí la fecha"
          detalle="Deslizá los días o usá el calendario"
        />

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
        <section className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <TituloSeccion
            Icono={Clock}
            titulo="Elegí el horario"
            detalle="Horarios disponibles para la fecha seleccionada"
          />

          <SelectorHorario
            slots={slots}
            horaSeleccionada={hora}
            onSelect={onSelectHora}
            cargando={cargandoSlots}
          />
        </section>
      )}

      {/* Barra inferior fija: total + continuar (se apoya sobre la navegación de la app) */}
      <div className="sticky bottom-[calc(var(--bottom-nav-h,4rem)+env(safe-area-inset-bottom,0px)+0.5rem)] z-30">
        <div
          className={`space-y-3 rounded-[24px] border border-border p-4 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)] transition-all duration-300 ${
            summaryBgStyle || 'bg-card'
          }`}
        >
          <div className="flex items-end justify-between gap-4 px-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted-foreground">Total estimado</p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {duracionTotal} min
              </p>
            </div>
            <span className="text-3xl font-black leading-none tabular-nums tracking-tight text-foreground">
              ${precioTotal.toLocaleString('es-AR')}
            </span>
          </div>

          <Button
            type="button"
            disabled={!fecha || !hora}
            onClick={onContinuar}
            className={`flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-extrabold shadow-md transition-all duration-200 active:scale-[0.98] ${
              buttonStyle ||
              'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40'
            }`}
          >
            <span>Continuar a confirmación</span>
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

