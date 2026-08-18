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
      <p className="text-center text-slate-500 py-8 text-sm">
        No hay promos disponibles para este género.
      </p>
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
            className={`rounded-2xl border-2 transition-all overflow-hidden ${
              seleccionada
                ? 'border-violet-600 bg-violet-50/40 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectPromo(seleccionada ? null : promo)}
              className="w-full p-4 text-left"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{promo.nombre_promo}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {promo.duracion_total_min} min
                    {promo.permite_swap && (
                      <span className="ml-2 text-violet-600">· Permite intercambio</span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-violet-600 text-lg">
                    ${Number(promo.precio_promo).toLocaleString()}
                  </p>
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 ml-auto flex items-center justify-center ${
                      seleccionada ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                    }`}
                  >
                    {seleccionada && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {seleccionada && zonasPromo.length > 0 && (
              <div className="px-4 pb-4 border-t border-violet-100 pt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Zonas incluidas
                </p>
                {promo.zonas_incluidas.map((zonaId) => {
                  const original = zonas.find((z) => z.id === zonaId);
                  const swapId = swaps[zonaId];
                  const actual = swapId ? zonas.find((z) => z.id === swapId) : original;
                  if (!actual) return null;

                  return (
                    <div
                      key={zonaId}
                      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {actual.nombre_zona}
                          {swapId && (
                            <span className="ml-1 text-xs text-violet-600">(intercambiada)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ETIQUETA_CATEGORIA[actual.categoria_zona]} · {actual.duracion_minutos} min
                        </p>
                      </div>
                      {promo.permite_swap && original && (
                        <button
                          type="button"
                          onClick={() => onSwapClick(zonaId)}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-800 px-2 py-1 rounded-lg hover:bg-violet-50"
                        >
                          Intercambiar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {seleccionada && zonasPromo.length === 0 && promo.zonas_incluidas.length === 0 && (
              <div className="px-4 pb-4 text-xs text-amber-600">
                Esta promo aún no tiene zonas vinculadas en la base de datos.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
