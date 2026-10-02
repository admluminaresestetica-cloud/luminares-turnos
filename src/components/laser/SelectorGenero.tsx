'use client';

import type { GeneroLaser } from '@/lib/types';
import { User, Star } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {OPCIONES.map((op) => {
        const activo = genero === op.valor;

        const isFemenino = op.valor === 'femenino';
        const colorAcento = isFemenino ? 'bg-rose-500' : 'bg-blue-500';
        const colorTextoAcento = isFemenino ? 'text-rose-500' : 'text-blue-500';
        const colorBordeActivo = isFemenino
          ? 'border-rose-500/80 ring-2 ring-rose-500/20'
          : 'border-blue-500/80 ring-2 ring-blue-500/20';

        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            aria-pressed={activo}
            className={`group relative flex flex-col justify-between overflow-hidden p-5 rounded-2xl border text-left transition-all duration-200 outline-none cursor-pointer select-none active:scale-[0.98] ${
              activo
                ? `bg-card text-card-foreground shadow-md ${colorBordeActivo}`
                : 'border-border bg-card text-card-foreground hover:border-muted-foreground/30 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {/* Barra de acento superior */}
            <div
              className={`absolute top-0 left-0 h-1 transition-all duration-300 ease-out ${colorAcento} ${
                activo ? 'w-full' : 'w-0 group-hover:w-12'
              }`}
            />

            <div className="relative flex items-center justify-between w-full gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                    activo ? 'text-foreground' : 'text-slate-700 dark:text-zinc-200'
                  }`}
                >
                  {op.label}
                </span>
                {activo && (
                  <Star className={`w-4 h-4 ${colorTextoAcento} animate-in fade-in duration-300`} />
                )}
              </div>

              {/* Indicador de Selección */}
              <div
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  activo
                    ? `${colorAcento} border-transparent scale-100`
                    : 'border-slate-300 dark:border-zinc-600 bg-transparent scale-95 group-hover:border-slate-400'
                }`}
              >
                <div
                  className={`rounded-full bg-white transition-all duration-200 ${
                    activo ? 'w-2 h-2 opacity-100 scale-100' : 'w-1.5 h-1.5 opacity-0 scale-0'
                  }`}
                />
              </div>
            </div>

            <p className="relative text-xs font-medium leading-relaxed text-muted-foreground">
              {op.descripcion}
            </p>
          </button>
        );
      })}
    </div>
  );
}