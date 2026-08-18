import type { GeneroLaser } from '@/lib/types';

interface Props {
  genero: GeneroLaser | null;
  onSelect: (genero: GeneroLaser) => void;
}

const OPCIONES: { valor: GeneroLaser; label: string; emoji: string }[] = [
  { valor: 'femenino', label: 'Femenino', emoji: '👩' },
  { valor: 'masculino', label: 'Masculino', emoji: '👨' },
];

export default function SelectorGenero({ genero, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {OPCIONES.map((op) => {
        const activo = genero === op.valor;
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            className={`p-6 rounded-2xl border-2 text-center transition-all ${
              activo
                ? 'border-violet-600 bg-violet-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-violet-300'
            }`}
          >
            <span className="text-3xl block mb-2">{op.emoji}</span>
            <span className={`font-semibold ${activo ? 'text-violet-700' : 'text-slate-800'}`}>
              {op.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
