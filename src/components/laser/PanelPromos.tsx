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
      <div className="bg-card border border-border rounded-[28px] p-8 text-center text-card-foreground">
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
          <article
            key={promo.id}
            className={`rounded-[28px] border bg-card overflow-hidden transition-colors ${
              seleccionada
                ? 'border-primary ring-1 ring-primary shadow-sm'
                : 'border-border'
            }`}
          >
            {/* Cabecera: título e info a la izquierda, precio a la derecha */}
            <button
              type="button"
              onClick={() => onSelectPromo(seleccionada ? null : promo)}
              aria-pressed={seleccionada}
              className="w-full p-5 text-left active:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="text-lg font-extrabold leading-tight tracking-tight text-foreground">
                    {promo.nombre_promo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {promo.duracion_total_min} min
                    </span>

                    {promo.permite_swap && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        <RefreshCw className="w-3 h-3" />
                        Permite intercambio
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    ${Number(promo.precio_promo).toLocaleString('es-AR')}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      seleccionada
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
              </div>
            </button>

            {/* Zonas incluidas: lista minimalista, sin cajas */}
            {seleccionada && zonasPromo.length > 0 && (
              <div className="mx-5 pb-2 border-t border-border animate-in fade-in duration-200">
                <p className="pt-4 pb-1 text-xs font-bold text-muted-foreground">
                  Zonas incluidas
                </p>
                <ul className="divide-y divide-border">
                  {promo.zonas_incluidas.map((zonaId) => {
                    const original = zonas.find((z) => z.id === zonaId);
                    const swapId = swaps[zonaId];
                    const actual = swapId ? zonas.find((z) => z.id === swapId) : original;
                    if (!actual) return null;

                    return (
                      <li key={zonaId} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {actual.nombre_zona}
                            {swapId && (
                              <span className="ml-2 text-[11px] font-semibold text-primary">
                                intercambiada
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                            {ETIQUETA_CATEGORIA[actual.categoria_zona]} · {actual.duracion_minutos} min
                          </p>
                        </div>

                        {promo.permite_swap && original && (
                          <button
                            type="button"
                            onClick={() => onSwapClick(zonaId)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-primary active:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Intercambiar
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {seleccionada && zonasPromo.length === 0 && promo.zonas_incluidas.length === 0 && (
              <p className="mx-5 border-t border-border py-4 text-xs font-medium text-muted-foreground">
                Esta promo aún no tiene zonas vinculadas en el sistema.
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
