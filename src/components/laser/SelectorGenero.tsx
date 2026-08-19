'use client';

import { User } from 'lucide-react';
import type { GeneroLaser } from '@/lib/types';

interface Props {
  genero: GeneroLaser | null;
  onSelect: (genero: GeneroLaser) => void;
}

const OPCIONES: { valor: GeneroLaser; label: string }[] = [
  { valor: 'femenino', label: 'Femenino' },
  { valor: 'masculino', label: 'Masculino' },
];

export default function SelectorGenero({ genero, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPCIONES.map((op) => {
        const activo = genero === op.valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            className={`flex items-center justify-center gap-2.5 p-4 rounded-xl border text-sm font-semibold transition-all ${
              activo
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <User className={`w-4 h-4 ${activo ? 'text-white' : 'text-slate-400'}`} />
            <span>{op.label}</span>
          </button>
        );
      })}
    </div>
  );
}
