'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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

// Cuántos días hacia adelante se recorren para armar la tira deslizante
const DIAS_CARRUSEL = 60;

export default function SelectorFecha({
  tipo,
  fechasLaser,
  diasSemana,
  fechaSeleccionada,
  onSelect,
}: Props) {
  const hoy = useMemo(() => new Date(), []);
  const [mesOffset, setMesOffset] = useState(0);
  // El calendario completo se despliega a pedido; la tira de días es el acceso rápido
  const [calAbierto, setCalAbierto] = useState(false);

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

  /* ---------------- Carrusel horizontal de días ---------------- */

  // Solo los días habilitados de los próximos días, para deslizar rápido
  const diasCarrusel = useMemo(() => {
    const lista: Date[] = [];
    for (let i = 0; i < DIAS_CARRUSEL; i++) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      if (isDateEnabled(d, tipo, fechasLaser, diasSemana)) lista.push(d);
    }
    return lista;
  }, [hoy, tipo, fechasLaser, diasSemana]);

  const tiraRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef({ activo: false, inicioX: 0, scrollInicial: 0, movido: false });

  // Al elegir una fecha (desde la tira o el calendario) la centramos en la tira
  // y llevamos el calendario a su mes.
  useEffect(() => {
    if (!fechaSeleccionada) return;

    tiraRef.current
      ?.querySelector<HTMLElement>(`[data-iso="${fechaSeleccionada}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });

    const [y, m] = fechaSeleccionada.split('-').map(Number);
    if (y && m) {
      const offset = (y - hoy.getFullYear()) * 12 + (m - 1 - hoy.getMonth());
      if (offset >= 0) setMesOffset(offset);
    }
  }, [fechaSeleccionada, hoy]);

  // Arrastre con mouse (en táctil el scroll nativo ya funciona)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !tiraRef.current) return;
    arrastre.current = {
      activo: true,
      inicioX: e.clientX,
      scrollInicial: tiraRef.current.scrollLeft,
      movido: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a.activo || !tiraRef.current) return;
    const dx = e.clientX - a.inicioX;
    if (Math.abs(dx) > 5) a.movido = true;
    tiraRef.current.scrollLeft = a.scrollInicial - dx;
  };
  const terminarArrastre = () => {
    arrastre.current.activo = false;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Tira deslizante de días */}
      {diasCarrusel.length > 0 && (
        <div
          ref={tiraRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={terminarArrastre}
          onPointerLeave={terminarArrastre}
          className="flex snap-x snap-proximity gap-2.5 overflow-x-auto overscroll-x-contain pb-2 cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
          aria-label="Próximos días disponibles"
        >
          {diasCarrusel.map((d) => {
            const iso = formatDateISO(d);
            const seleccionada = fechaSeleccionada === iso;
            const esHoy = formatDateISO(hoy) === iso;

            return (
              <button
                key={iso}
                type="button"
                data-iso={iso}
                aria-pressed={seleccionada}
                onClick={() => {
                  if (arrastre.current.movido) {
                    arrastre.current.movido = false;
                    return;
                  }
                  onSelect(iso);
                }}
                className={`flex h-24 w-[4.5rem] shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[20px] border transition-all duration-150 active:scale-95 cursor-pointer ${
                  seleccionada
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-border bg-card text-foreground shadow-xs hover:border-primary/40'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    seleccionada ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {esHoy ? 'Hoy' : DIAS_CORTOS[getIsoWeekday(d) - 1]}
                </span>
                <span className="text-2xl font-black leading-none tabular-nums tracking-tight">
                  {d.getDate()}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    seleccionada ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {MESES[d.getMonth()].slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {diasCarrusel.length > 0 && (
        <button
          type="button"
          onClick={() => setCalAbierto((v) => !v)}
          aria-expanded={calAbierto}
          className="mx-auto flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-bold text-foreground shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Calendar className="h-4 w-4 text-primary" />
          {calAbierto ? 'Ocultar calendario' : 'Ver calendario completo'}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${calAbierto ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Calendario mensual */}
      {(calAbierto || diasCarrusel.length === 0) && (
      <div className="rounded-[24px] border border-border bg-card p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Cabecera del calendario */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMesOffset((m) => m - 1)}
            disabled={mesOffset === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all active:scale-90 disabled:opacity-30 cursor-pointer"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h3 className="text-lg font-extrabold tracking-tight text-foreground">
            {MESES[month]} {year}
          </h3>

          <button
            type="button"
            onClick={() => setMesOffset((m) => m + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all active:scale-90 cursor-pointer"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {DIAS_CORTOS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-bold text-muted-foreground">
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
                  relative mx-auto flex aspect-square w-full max-w-[3rem] flex-col items-center justify-center rounded-full border-2 text-sm transition-all duration-150 active:scale-95
                  ${
                    seleccionada
                      ? 'z-10 border-primary bg-primary/10 font-black text-primary'
                      : habilitada
                      ? 'cursor-pointer border-transparent font-bold text-foreground hover:bg-muted'
                      : 'cursor-not-allowed border-transparent font-medium text-muted-foreground/40'
                  }
                `}
              >
                <span>{fecha.getDate()}</span>

                {/* Indicador sutil para el día de HOY si no está seleccionado */}
                {esHoy && !seleccionada && (
                  <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda de servicio Láser */}
        {tipo === 'laser' && fechasLaser.length > 0 && (
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span>Los días en negrita son los disponibles para la jornada láser.</span>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
