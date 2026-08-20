'use client';

import { Check, Clock, RefreshCw } from 'lucide-react';
import type { PromoLaser, ServicioLaser } from '@/lib/types';
import {
  ETIQUETA_CATEGORIA,
  getZonasPromoResueltas,
  type SwapsMap,
} from '@/lib/laser/calculos';

interface Props {
  promos: PromoLaser[];
  zonas: ServicioLaser[];
  promoSeleccionada: PromoLaser | null;
  swaps: SwapsMap;
  onSelectPromo: (promo: PromoLaser | null) => void;
  onSwapClick: (zonaOriginalId: string) => void;
}

export default function PanelPromos({
  promos,
  zonas,
  promoSeleccionada,
  swaps,
  onSelectPromo,
  onSwapClick,
}: Props) {
  if (promos.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-slate-500 text-sm font-medium">
          No hay promociones disponibles para este perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {promos.map((promo) => {
        const seleccionada = promoSeleccionada?.id === promo.id;
        const zonasPromo = getZonasPromoResueltas(promo, zonas, swaps);

        return (
          <div
            key={promo.id}
            className={`rounded-2xl border transition-all overflow-hidden ${
              seleccionada
                ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-sm'
                : 'border-slate-200/80 bg-white hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectPromo(seleccionada ? null : promo)}
              className="w-full p-3.5 sm:p-5 text-left active:bg-slate-50/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {promo.nombre_promo}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {promo.duracion_total_min} min
                    </span>

                    {promo.permite_swap && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold">
                        <RefreshCw className="w-3 h-3 text-emerald-600" />
                        Permite intercambio
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5 sm:gap-3">
                  <div>
                    <p className="font-bold text-slate-900 text-base sm:text-xl tracking-tight">
                      ${Number(promo.precio_promo).toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                      seleccionada
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {seleccionada && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </button>

            {/* Zonas Incluidas */}
            {seleccionada && zonasPromo.length > 0 && (
              <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 border-t border-slate-100 bg-slate-50/50 pt-3.5 space-y-2">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Zonas incluidas en esta promo
                </p>
                {promo.zonas_incluidas.map((zonaId) => {
                  const original = zonas.find((z) => z.id === zonaId);
                  const swapId = swaps[zonaId];
                  const actual = swapId ? zonas.find((z) => z.id === swapId) : original;
                  if (!actual) return null;

                  return (
                    <div
                      key={zonaId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-3 sm:px-3.5 sm:py-2.5 border border-slate-200/60 shadow-2xs gap-2 sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>{actual.nombre_zona}</span>
                          {swapId && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                              intercambiada
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {ETIQUETA_CATEGORIA[actual.categoria_zona]} · {actual.duracion_minutos} min
                        </p>
                      </div>

                      {promo.permite_swap && original && (
                        <button
                          type="button"
                          onClick={() => onSwapClick(zonaId)}
                          className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors w-full sm:w-auto active:scale-95"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          Intercambiar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {seleccionada && zonasPromo.length === 0 && promo.zonas_incluidas.length === 0 && (
              <div className="px-4 pb-4 text-xs text-amber-600 bg-amber-50/50 pt-3 border-t border-amber-100">
                Esta promo aún no tiene zonas vinculadas en el sistema.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}