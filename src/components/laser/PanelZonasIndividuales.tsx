import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonas: ServicioLaser[];
  seleccionadas: string[];
  onToggle: (zonaId: string) => void;
}

export default function PanelZonasIndividuales({ zonas, seleccionadas, onToggle }: Props) {
  if (zonas.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8 text-sm">
        No hay zonas disponibles para este género.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {zonas.map((zona) => {
        const activa = seleccionadas.includes(zona.id);
        return (
          <button
            key={zona.id}
            type="button"
            onClick={() => onToggle(zona.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              activa
                ? 'border-violet-600 bg-violet-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${
                activa ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
              }`}
            >
              {activa && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">{zona.nombre_zona}</p>
              <p className="text-xs text-slate-500">
                {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
              </p>
            </div>
            <p className="font-bold text-violet-600 shrink-0">
              ${Number(zona.precio_lista).toLocaleString()}
            </p>
          </button>
        );
      })}
    </div>
  );
}
