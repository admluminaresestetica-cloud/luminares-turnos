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
          if (valor === 'femenino') return 'bg-rose-500'; // Rosa para femenino
          if (valor === 'masculino') return 'bg-blue-500'; // Azul para masculino
          return 'bg-slate-900'; // Default de seguridad
        };

        const colorAcento = getColorAcento(op.valor);

        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelect(op.valor)}
            aria-pressed={activo}
            className={`group relative flex flex-col justify-between overflow-hidden p-5 sm:p-6 min-h-[104px] rounded-3xl border-2 text-left transition-all duration-300 ease-out outline-none cursor-pointer select-none focus-visible:ring-4 focus-visible:ring-offset-2 active:scale-[0.98] ${
              activo
                ? 'border-slate-900 bg-white shadow-xl shadow-slate-900/10 -translate-y-1 focus-visible:ring-slate-900/15'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-slate-900/10'
            }`}
          >
            {/* Resplandor decorativo cuando está activo */}
            <div
              className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl transition-opacity duration-300 ${
                activo ? 'opacity-100 bg-slate-900/[0.06]' : 'opacity-0'
              }`}
            />

            {/* Barra de acento superior (Ahora con colores por género) */}
            <div
              className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-300 ease-out ${colorAcento} ${
                activo ? 'w-full' : 'w-0 group-hover:w-8'
              }`}
            />

            <div className="relative flex items-start justify-between w-full gap-3 mb-2.5">
              <span
                className={`text-lg sm:text-xl font-black tracking-tight transition-colors ${
                  activo ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {op.label}
              </span>

              {/* Indicador tipo Radio Button estilizado */}
              <div
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  activo
                    ? 'border-slate-900 bg-slate-900 scale-100'
                    : 'border-slate-300 bg-transparent scale-95 group-hover:border-slate-400 group-hover:scale-100'
                }`}
              >
                <div
                  className={`rounded-full bg-white transition-all duration-300 ${
                    activo ? 'w-2 h-2 opacity-100 scale-100' : 'w-2 h-2 opacity-0 scale-0'
                  }`}
                />
              </div>
            </div>

            <p
              className={`relative text-xs sm:text-[13px] font-medium leading-relaxed transition-colors ${
                activo ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-600'
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