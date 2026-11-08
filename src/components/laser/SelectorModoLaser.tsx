'use client';

import { Star, Layers } from 'lucide-react';
import type { ModoLaser } from '@/lib/laser/calculos';

interface Props {
  modo: ModoLaser;
  onChange: (modo: ModoLaser) => void;
}

const OPCIONES: { valor: ModoLaser; label: string; Icono: typeof Star }[] = [
  { valor: 'promo', label: 'Promos fijas', Icono: Star },
  { valor: 'zonas', label: 'Zonas individuales', Icono: Layers },
];

export default function SelectorModoLaser({ modo, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Modo de selección"
      className="grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
    >
      {OPCIONES.map(({ valor, label, Icono }) => {
        const activo = modo === valor;
        return (
          <button
            key={valor}
            type="button"
            onClick={() => onChange(valor)}
            aria-pressed={activo}
            className={`flex h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer ${
              activo
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icono className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
