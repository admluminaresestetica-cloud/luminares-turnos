'use client';

import { Check, Plus } from 'lucide-react';
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-slate-500 text-sm font-medium">
          No hay zonas disponibles para este perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
      {zonas.map((zona) => {
        const activa = seleccionadas.includes(zona.id);
        return (
          <button
            key={zona.id}
            type="button"
            onClick={() => onToggle(zona.id)}
            className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
              activa
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                activa
                  ? 'border-white bg-white text-slate-900'
                  : 'border-slate-300 bg-white text-transparent'
              }`}
            >
              {activa ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Plus className="w-3 h-3 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-bold truncate ${activa ? 'text-white' : 'text-slate-900'}`}>
                {zona.nombre_zona}
              </p>
              <p className={`text-[11px] sm:text-xs truncate ${activa ? 'text-slate-300' : 'text-slate-400'}`}>
                {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
              </p>
            </div>

            <p className={`text-xs sm:text-sm font-bold shrink-0 ${activa ? 'text-white' : 'text-slate-900'}`}>
              ${Number(zona.precio_lista).toLocaleString('es-AR')}
            </p>
          </button>
        );
      })}
    </div>
  );
}