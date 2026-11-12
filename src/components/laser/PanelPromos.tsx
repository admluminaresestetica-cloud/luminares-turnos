'use client';

import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { Check, Clock, RefreshCw, Sparkles } from 'lucide-react';
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

const listaVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const tarjetaVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
};

export default function PanelPromos({
  promos,
  zonas,
  promoSeleccionada,
  swaps,
  onSelectPromo,
  onSwapClick,
}: Props) {
  const reducirMovimiento = useReducedMotion();

  if (promos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="rounded-[28px] border border-border bg-card/80 backdrop-blur-xl p-10 text-center text-card-foreground shadow-xl shadow-black/5 dark:shadow-black/20"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        </div>
        <p className="text-sm font-bold text-muted-foreground">
          No hay promociones disponibles para este perfil.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={reducirMovimiento ? undefined : listaVariants}
      initial={reducirMovimiento ? undefined : 'hidden'}
      animate={reducirMovimiento ? undefined : 'show'}
      className="space-y-3.5"
    >
      {promos.map((promo) => {
        const seleccionada = promoSeleccionada?.id === promo.id;
        const zonasPromo = getZonasPromoResueltas(promo, zonas, swaps);

        return (
          <motion.article
            key={promo.id}
            variants={reducirMovimiento ? undefined : tarjetaVariants}
            whileHover={reducirMovimiento ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`relative rounded-[28px] border backdrop-blur-xl overflow-hidden transition-all duration-200 ${
              seleccionada
                ? 'border-primary bg-card shadow-xl shadow-primary/15 ring-1 ring-primary'
                : 'border-border bg-card/80 hover:border-primary/40 shadow-lg shadow-black/5 dark:shadow-black/20'
            }`}
          >
            {/* Resplandor interno sutil cuando la promo está seleccionada */}
            {seleccionada && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent"
              />
            )}

            {/* Cabecera: título e info a la izquierda, precio a la derecha */}
            <motion.button
              type="button"
              whileTap={reducirMovimiento ? undefined : { scale: 0.985 }}
              onClick={() => onSelectPromo(seleccionada ? null : promo)}
              aria-pressed={seleccionada}
              className="relative z-10 w-full p-5 text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <h3 className="text-lg font-black leading-tight tracking-tight text-foreground">
                    {promo.nombre_promo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 font-bold text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {promo.duracion_total_min} min
                    </span>

                    {promo.permite_swap && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-extrabold text-primary">
                        <RefreshCw className="w-3 h-3" />
                        Permite intercambio
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pt-0.5">
                  <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
                    ${Number(promo.precio_promo).toLocaleString('es-AR')}
                  </span>
                  <div
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      seleccionada
                        ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105'
                        : 'border-border bg-background/80 text-transparent scale-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Zonas incluidas: se despliega siempre que la promo esté seleccionada */}
            <AnimatePresence initial={false}>
              {seleccionada && (
                <motion.div
                  key="zonas-incluidas"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="relative z-10 overflow-hidden"
                >
                  <div className="mx-5 pb-4 border-t border-border/80">
                    <p className="pt-4 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Zonas incluidas
                    </p>

                    {promo.zonas_incluidas.length > 0 ? (
                      <ul className="divide-y divide-border/60">
                        {promo.zonas_incluidas.map((zonaId) => {
                          const original = zonas.find((z) => z.id === zonaId);
                          const swapId = swaps[zonaId];
                          const actual = swapId ? zonas.find((z) => z.id === swapId) : original;
                          if (!actual) return null;

                          return (
                            <li key={zonaId} className="flex items-center justify-between gap-3 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-foreground">
                                  {actual.nombre_zona}
                                  {swapId && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                                      intercambiada
                                    </span>
                                  )}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                                  {ETIQUETA_CATEGORIA[actual.categoria_zona]} · {actual.duracion_minutos} min
                                </p>
                              </div>

                              {promo.permite_swap && original && (
                                <motion.button
                                  type="button"
                                  whileTap={reducirMovimiento ? undefined : { scale: 0.94 }}
                                  whileHover={reducirMovimiento ? undefined : { scale: 1.03 }}
                                  transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                                  onClick={() => onSwapClick(zonaId)}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 hover:bg-primary/15 px-3 py-1.5 text-xs font-extrabold text-primary shadow-xs transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Intercambiar
                                </motion.button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="py-2 text-xs font-semibold text-muted-foreground">
                        Esta promo aún no tiene zonas vinculadas en el sistema.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </motion.div>
  );
}