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
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center text-card-foreground">
        <p className="text-muted-foreground text-sm font-medium">
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
                ? 'border-primary bg-card ring-1 ring-primary shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/30'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectPromo(seleccionada ? null : promo)}
              className="w-full p-3.5 sm:p-5 text-left active:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm sm:text-base leading-snug">
                    {promo.nombre_promo}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {promo.duracion_total_min} min
                    </span>

                    {promo.permite_swap && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold">
                        <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Permite intercambio
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5 sm:gap-3">
                  <div>
                    <p className="font-bold text-foreground text-base sm:text-xl tracking-tight">
                      ${Number(promo.precio_promo).toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                      seleccionada
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 bg-background'
                    }`}
                  >
                    {seleccionada && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </button>

            {/* Zonas Incluidas */}
            {seleccionada && zonasPromo.length > 0 && (
              <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 border-t border-border bg-muted/40 pt-3.5 space-y-2">
                <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-card rounded-xl p-3 sm:px-3.5 sm:py-2.5 border border-border shadow-xs gap-2 sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                          <span>{actual.nombre_zona}</span>
                          {swapId && (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                              intercambiada
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {ETIQUETA_CATEGORIA[actual.categoria_zona]} · {actual.duracion_minutos} min
                        </p>
                      </div>

                      {promo.permite_swap && original && (
                        <button
                          type="button"
                          onClick={() => onSwapClick(zonaId)}
                          className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/80 px-2.5 py-1.5 rounded-lg transition-colors w-full sm:w-auto active:scale-95 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-muted-foreground" />
                          Intercambiar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {seleccionada && zonasPromo.length === 0 && promo.zonas_incluidas.length === 0 && (
              <div className="px-4 pb-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 pt-3 border-t border-amber-200/40 dark:border-amber-900/40">
                Esta promo aún no tiene zonas vinculadas en el sistema.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}