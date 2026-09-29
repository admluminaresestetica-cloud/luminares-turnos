'use client';

import { Star, Layers } from 'lucide-react';
import type { ModoLaser } from '@/lib/laser/calculos';

interface Props {
  modo: ModoLaser;
  onChange: (modo: ModoLaser) => void;
}

export default function SelectorModoLaser({ modo, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-border bg-muted/50 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange('promo')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          modo === 'promo'
            ? 'bg-card text-foreground shadow-xs border border-border/50'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${modo === 'promo' ? 'text-foreground' : 'text-muted-foreground'}`} />
        Promos fijas
      </button>

      <button
        type="button"
        onClick={() => onChange('zonas')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          modo === 'zonas'
            ? 'bg-card text-foreground shadow-xs border border-border/50'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Layers className={`w-3.5 h-3.5 ${modo === 'zonas' ? 'text-foreground' : 'text-muted-foreground'}`} />
        Zonas individuales
      </button>
    </div>
  );
}