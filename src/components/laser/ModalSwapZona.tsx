import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonaOriginal: ServicioLaser;
  opciones: ServicioLaser[];
  onSelect: (nuevaZonaId: string) => void;
  onClose: () => void;
}

export default function ModalSwapZona({ zonaOriginal, opciones, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-800">Intercambiar zona</h3>
              <p className="text-sm text-slate-500 mt-1">
                Reemplazá <strong>{zonaOriginal.nombre_zona}</strong> por otra zona{' '}
                <strong>{ETIQUETA_CATEGORIA[zonaOriginal.categoria_zona]}</strong> equivalente
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-2">
          {opciones.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">
              No hay zonas equivalentes disponibles para intercambiar.
            </p>
          ) : (
            opciones.map((zona) => (
              <button
                key={zona.id}
                type="button"
                onClick={() => onSelect(zona.id)}
                className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 text-left transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-800">{zona.nombre_zona}</p>
                  <p className="text-xs text-slate-500">{zona.duracion_minutos} min</p>
                </div>
                <p className="font-bold text-violet-600">
                  ${Number(zona.precio_lista).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
