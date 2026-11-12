'use client';

import { Mars, Venus } from 'lucide-react';
import type { GeneroLaser } from '@/lib/types';

interface Props {
  genero: GeneroLaser | null;
  onSelect: (genero: GeneroLaser) => void;
  /** Versión reducida tipo interruptor, para cambiar de perfil en el paso 2 */
  compacto?: boolean;
}

const OPCIONES: {
  valor: GeneroLaser;
  label: string;
  descripcion: string;
  Icono: typeof Venus;
}[] = [
  {
    valor: 'femenino',
    label: 'Femenino',
    descripcion: 'Promos y zonas para cuerpo y rostro femenino',
    Icono: Venus,
  },
  {
    valor: 'masculino',
    label: 'Masculino',
    descripcion: 'Promos y zonas para cuerpo y rostro masculino',
    Icono: Mars,
  },
];

export default function SelectorGenero({ genero, onSelect, compacto = false }: Props) {
  if (compacto) {
    return (
      <div
        role="group"
        aria-label="Perfil"
        className="grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
      >
        {OPCIONES.map(({ valor, label, Icono }) => {
          const activo = genero === valor;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onSelect(valor)}
              aria-pressed={activo}
              className={`flex h-10 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${
                activo
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icono className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {OPCIONES.map(({ valor, label, descripcion, Icono }) => {
        const activo = genero === valor;

        return (
          <button
            key={valor}
            type="button"
            onClick={() => onSelect(valor)}
            aria-pressed={activo}
            className={`flex w-full items-center gap-4 rounded-[28px] border p-5 text-left shadow-xs outline-none transition-all select-none cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:items-start sm:gap-6 sm:p-6 ${
              activo ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                activo ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <Icono className="h-7 w-7" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-lg font-extrabold tracking-tight text-foreground">
                {label}
              </span>
              <span className="mt-0.5 block text-xs font-medium leading-relaxed text-muted-foreground">
                {descripcion}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
