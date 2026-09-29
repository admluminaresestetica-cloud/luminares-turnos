'use client';

import type { GeneroLaser } from '@/lib/types';

interface Props {
  genero: GeneroLaser | null;
  onSelect: (genero: GeneroLaser) => void;
}

const OPCIONES: { valor: GeneroLaser; label: string; descripcion: string }[] = [
  {
    valor: 'femenino',
    label: 'Femenino',
    descripcion: 'Promos y zonas enfocadas en cuerpo/rostro femenino',
  },
  {
    valor: 'masculino',
    label: 'Masculino',
    descripcion: 'Promos y zonas enfocadas en cuerpo/rostro masculino',
  },
];

export default function SelectorGenero({ genero, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {OPCIONES.map((op) => {
        const activo = genero === op.valor;

        // Función para definir el color de la línea superior por género
        const getColorAcento = (valor: GeneroLaser) => {
          if (valor === 'femenino') return 'bg-rose-500';
          if (valor === 'masculino') return 'bg-blue-500';
          return 'bg-primary';
        };

        const colorAcento = getColorAcento(op.valor);

        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            aria-pressed={activo}
            className={`group relative flex flex-col justify-between overflow-hidden p-5 sm:p-6 min-h-[104px] rounded-3xl border-2 text-left transition-all duration-300 ease-out outline-none cursor-pointer select-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 active:scale-[0.98] ${
              activo
                ? 'border-primary bg-card text-card-foreground shadow-xl shadow-foreground/5 -translate-y-1'
                : 'border-border bg-card text-card-foreground hover:border-muted-foreground/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5'
            }`}
          >
            {/* Resplandor decorativo cuando está activo */}
            <div
              className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl transition-opacity duration-300 ${
                activo ? 'opacity-100 bg-primary/10' : 'opacity-0'
              }`}
            />

            {/* Barra de acento superior */}
            <div
              className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-300 ease-out ${colorAcento} ${
                activo ? 'w-full' : 'w-0 group-hover:w-8'
              }`}
            />

            <div className="relative flex items-start justify-between w-full gap-3 mb-2.5">
              <span
                className={`text-lg sm:text-xl font-black tracking-tight transition-colors ${
                  activo ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {op.label}
              </span>

              {/* Indicador tipo Radio Button estilizado */}
              <div
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  activo
                    ? 'border-primary bg-primary scale-100'
                    : 'border-muted-foreground/30 bg-transparent scale-95 group-hover:border-muted-foreground/60 group-hover:scale-100'
                }`}
              >
                <div
                  className={`rounded-full bg-primary-foreground transition-all duration-300 ${
                    activo ? 'w-2 h-2 opacity-100 scale-100' : 'w-2 h-2 opacity-0 scale-0'
                  }`}
                />
              </div>
            </div>

            <p
              className={`relative text-xs sm:text-[13px] font-medium leading-relaxed transition-colors ${
                activo ? 'text-muted-foreground' : 'text-muted-foreground/80 group-hover:text-muted-foreground'
              }`}
            >
              {op.descripcion}
            </p>
          </button>
        );
      })}
    </div>
  );
}