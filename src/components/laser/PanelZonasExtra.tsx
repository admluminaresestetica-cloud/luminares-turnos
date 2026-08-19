'use client';

import { Check, Plus } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA, precioZonaExtraConDescuento } from '@/lib/laser/calculos';

interface Props {
  zonas: ServicioLaser[];
  zonasPromoIds: string[];
  zonasExtraIds: string[];
  onToggleExtra: (zonaId: string) => void;
}

export default function PanelZonasExtra({
  zonas,
  zonasPromoIds,
  zonasExtraIds,
  onToggleExtra,
}: Props) {
  const disponibles = zonas.filter((z) => !zonasPromoIds.includes(z.id));

  if (disponibles.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sumar zonas adicionales</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Elegí zonas extras para complementar tu promo
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
          10% OFF EXTRA
        </span>
      </div>

      <div className="space-y-2">
        {disponibles.map((zona) => {
          const activa = zonasExtraIds.includes(zona.id);
          const precioConDesc = precioZonaExtraConDescuento(zona);
          return (
            <button
              key={zona.id}
              type="button"
              onClick={() => onToggleExtra(zona.id)}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
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
                <p className={`text-xs font-bold ${activa ? 'text-white' : 'text-slate-800'}`}>
                  {zona.nombre_zona}
                </p>
                <p className={`text-[11px] ${activa ? 'text-slate-300' : 'text-slate-400'}`}>
                  {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-[11px] line-through ${activa ? 'text-slate-400' : 'text-slate-400'}`}>
                  ${Number(zona.precio_lista).toLocaleString()}
                </p>
                <p className={`text-xs font-bold ${activa ? 'text-white' : 'text-slate-900'}`}>
                  ${Math.round(precioConDesc).toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}