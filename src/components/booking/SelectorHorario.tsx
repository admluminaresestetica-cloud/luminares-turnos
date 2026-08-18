'use client';

interface Props {
  slots: string[];
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  cargando?: boolean;
}

export default function SelectorHorario({ slots, horaSeleccionada, onSelect, cargando }: Props) {
  if (cargando) {
    return <p className="text-sm text-slate-400 py-4 text-center">Calculando horarios...</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4">
        No hay turnos disponibles para esta fecha con la duración seleccionada.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((hora) => (
        <button
          key={hora}
          type="button"
          onClick={() => onSelect(hora)}
          className={`
            py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors
            ${horaSeleccionada === hora
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50'
            }
          `}
        >
          {hora}
        </button>
      ))}
    </div>
  );
}
