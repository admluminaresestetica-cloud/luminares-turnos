'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid, Sparkles } from 'lucide-react';
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

  // Si es láser, filtramos y mostramos exclusivamente las fechas activas de la jornada
  const diasLaserDisponibles = useMemo(() => {
    if (tipo !== 'laser') return [];
    const hoyIso = formatDateISO(hoy);
    return fechasLaser
      .filter((iso) => iso >= hoyIso)
      .sort()
      .map((iso) => new Date(iso + 'T00:00:00'));
  }, [tipo, fechasLaser, hoy]);

  // Carrusel estándar para servicio general
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

  useEffect(() => {
    if (mostrarCalendarioCompleto || !fechaSeleccionada) return;
    const el = scrollRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [fechaSeleccionada, mostrarCalendarioCompleto]);

  // 🎯 Vista exclusiva y directa para depilación láser
  if (tipo === 'laser') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-foreground tracking-tight">
              Próximas jornadas láser disponibles
            </span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {diasLaserDisponibles.length} {diasLaserDisponibles.length === 1 ? 'fecha' : 'fechas'}
          </span>
        </div>

        {diasLaserDisponibles.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No hay jornadas láser programadas próximamente.</p>
            <p className="text-xs text-muted-foreground">Por favor, consultanos por nuestros canales habituales para conocer nuevas fechas.</p>
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300"
          >
            {diasLaserDisponibles.map((fecha) => {
              const iso = formatDateISO(fecha);
              const seleccionada = fechaSeleccionada === iso;
              const nombreDia = DIAS_LETRAS_CORTAS[fecha.getDay()];
              const nombreMes = MESES[fecha.getMonth()];

              return (
                <button
                  key={iso}
                  type="button"
                  data-selected={seleccionada}
                  onClick={() => onSelect(iso)}
                  className={`
                    relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-start gap-1 cursor-pointer shadow-xs active:scale-[0.98]
                    ${
                      seleccionada
                        ? 'bg-primary text-primary-foreground border-primary shadow-md ring-4 ring-primary/20'
                        : 'bg-card text-card-foreground border-border/80 hover:border-primary/50 hover:bg-accent/50'
                    }
                  `}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${seleccionada ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                    {nombreDia}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight tabular-nums">
                      {fecha.getDate()}
                    </span>
                    <span className={`text-xs font-semibold capitalize ${seleccionada ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                      {nombreMes}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Vista estándar de carrusel/calendario para servicios generales
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-base font-extrabold capitalize tracking-tight text-foreground">
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
          className="h-10 gap-2 rounded-xl px-3.5 text-sm font-extrabold text-primary hover:bg-primary/10 cursor-pointer"
        >
          <Grid className="w-4 h-4" />
          <span>{mostrarCalendarioCompleto ? 'Ver carrusel' : 'Ver mes'}</span>
        </Button>
      </div>

      {!mostrarCalendarioCompleto ? (
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
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg ring-4 ring-primary/20'
                      : habilitada
                      ? 'bg-card text-card-foreground border-border hover:border-primary/40 hover:bg-accent'
                      : 'bg-muted/50 text-muted-foreground/40 border-border/40 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <span
                  className={`text-xs font-bold ${
                    seleccionada ? 'opacity-90' : 'text-muted-foreground'
                  }`}
                >
                  {esHoy ? 'Hoy' : nombreDia}
                </span>
                <span className="text-3xl font-black leading-none tracking-tight tabular-nums">
                  {fecha.getDate()}
                </span>
                {esHoy && !seleccionada && (
                  <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border rounded-[28px] p-5 sm:p-6 shadow-none animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m - 1)}
              disabled={mesOffset === 0}
              className="h-11 w-11 rounded-2xl border-border text-foreground bg-card hover:bg-accent cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h3 className="text-base font-extrabold tracking-tight text-foreground">
              {MESES[month]} {year}
            </h3>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMesOffset((m) => m + 1)}
              className="h-11 w-11 rounded-2xl border-border text-foreground bg-card hover:bg-accent cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {DIAS_CORTOS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-bold text-muted-foreground"
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
                      ? 'bg-primary text-primary-foreground shadow-md z-10 ring-4 ring-primary/20'
                      : habilitada
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 cursor-pointer'
                      : 'bg-muted/40 text-muted-foreground/30 border border-border/50 cursor-not-allowed'
                  }
                `}
              >
                <span>{fecha.getDate()}</span>
                {esHoy && !seleccionada && (
                  <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}