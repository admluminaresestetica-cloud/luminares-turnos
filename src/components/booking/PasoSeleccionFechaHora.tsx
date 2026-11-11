'use client';

import { useMemo } from 'react';
import { Calendar, Clock, CircleDollarSign, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

// Altura segura para que en celular quede flotando holgadamente ENCIMA de la barra de navegación inferior
const OFFSET_NAV =
  'bottom-[calc(var(--bottom-nav-height,5rem)+env(safe-area-inset-bottom,0px)+1rem)]';

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
    <div className="relative pb-36 lg:pb-12 animate-in fade-in duration-300 w-full">
      {/* Estructura en 2 columnas amplias para PC (7 cols para calendario/horarios, 5 para el panel fijo) */}
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 w-full">
        
        {/* Columna Izquierda: Fecha y Horarios */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tarjeta Fecha */}
          <section className="space-y-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="p-2.5 rounded-2xl bg-background border-border text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
              </Badge>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground leading-tight">
                  Elegí la fecha
                </h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
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

          {/* Tarjeta Horarios (optimizada en grilla de 2 o 3 columnas en PC para evitar scroll infinito) */}
          {fecha && (
            <section className="space-y-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="p-2.5 rounded-2xl bg-background border-border text-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                </Badge>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground leading-tight">
                    Elegí el horario
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
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
        </div>

        {/* Columna Derecha: Panel Lateral Fijo en PC / Flotante seguro en Celular */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 mt-6 lg:mt-0">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed ${OFFSET_NAV} left-4 right-4 z-40 mx-auto w-full max-w-md lg:static lg:inset-auto lg:max-w-none lg:mx-0`}
          >
            <div
              className={`rounded-3xl border border-border/80 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 shadow-2xl lg:shadow-md ${
                summaryBgStyle || ''
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                      <CircleDollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block leading-none">
                        Total estimado
                      </span>
                      {resumenTurno ? (
                        <span className="text-xs font-medium capitalize text-foreground truncate block mt-1">
                          {resumenTurno}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground block mt-1">
                          Seleccioná fecha y hora
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl lg:text-3xl font-black tracking-tight text-foreground tabular-nums block leading-none">
                      ${precioTotal.toLocaleString('es-AR')}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground block mt-1">
                      {duracionTotal} min
                    </span>
                  </div>
                </div>

                  <Button
                  type="button"
                  disabled={!fecha || !hora}
                  onClick={onContinuar}
                  className={`w-full h-14 sm:h-13 px-6 rounded-2xl text-sm sm:text-base font-extrabold shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                    buttonStyle ||
                    'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40'
                  }`}
                >
                  <span>Continuar a confirmación</span>
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}