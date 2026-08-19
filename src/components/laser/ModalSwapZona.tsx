'use client';

import { X, ArrowRightLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col border border-slate-200/80 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Intercambiar zona</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Reemplazá <strong className="font-semibold text-slate-800">{zonaOriginal.nombre_zona}</strong> por otra zona{' '}
                <span className="font-semibold text-slate-700">
                  {ETIQUETA_CATEGORIA[zonaOriginal.categoria_zona]}
                </span>{' '}
                de igual categoría.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Opciones */}
        <div className="overflow-y-auto p-4 space-y-2">
          {opciones.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-slate-500 text-xs font-medium">
                No hay zonas equivalentes disponibles para realizar el intercambio.
              </p>
            </div>
          ) : (
            opciones.map((zona) => (
              <button
                key={zona.id}
                type="button"
                onClick={() => onSelect(zona.id)}
                className="w-full flex justify-between items-center p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-900 hover:bg-slate-50 text-left transition-all group shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    {zona.nombre_zona}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {zona.duracion_minutos} min
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  ${Number(zona.precio_lista).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer opcional de cierre */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}