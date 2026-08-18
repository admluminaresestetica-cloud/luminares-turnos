import type { ModoLaser } from '@/lib/laser/calculos';

interface Props {
  modo: ModoLaser;
  onChange: (modo: ModoLaser) => void;
}

export default function SelectorModoLaser({ modo, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange('promo')}
        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
          modo === 'promo'
            ? 'bg-white text-violet-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`}
      >
        Promos fijas
      </button>
      <button
        type="button"
        onClick={() => onChange('zonas')}
        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
          modo === 'zonas'
            ? 'bg-white text-violet-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`}
      >
        Zonas individuales
      </button>
    </div>
  );
}
