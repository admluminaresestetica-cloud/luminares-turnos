'use client';

import { Sparkles, Layers } from 'lucide-react';
import type { ModoLaser } from '@/lib/laser/calculos';

interface Props {
  modo: ModoLaser;
  onChange: (modo: ModoLaser) => void;
}

export default function SelectorModoLaser({ modo, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange('promo')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
          modo === 'promo'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${modo === 'promo' ? 'text-slate-900' : 'text-slate-400'}`} />
        Promos fijas
      </button>

      <button
        type="button"
        onClick={() => onChange('zonas')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
          modo === 'zonas'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Layers className={`w-3.5 h-3.5 ${modo === 'zonas' ? 'text-slate-900' : 'text-slate-400'}`} />
        Zonas individuales
      </button>
    </div>
  );
}
