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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {OPCIONES.map((op) => {
        const activo = genero === op.valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 outline-none cursor-pointer select-none ${
              activo
                ? 'border-slate-900 bg-white ring-1 ring-slate-900/10 shadow-md shadow-slate-900/5 -translate-y-0.5'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span
                className={`text-base font-bold tracking-tight transition-colors ${
                  activo ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {op.label}
              </span>

              {/* Indicador tipo Radio Button estilizado */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  activo
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300 bg-transparent group-hover:border-slate-400'
                }`}
              >
                {activo && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              {op.descripcion}
            </p>
          </button>
        );
      })}
    </div>
  );
}