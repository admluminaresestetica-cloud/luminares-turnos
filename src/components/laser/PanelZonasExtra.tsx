'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, Plus, Sparkles } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA, precioZonaExtraConDescuento } from '@/lib/laser/calculos';

interface Props {
  zonas: ServicioLaser[];
  zonasPromoIds: string[];
  zonasExtraIds: string[];
  onToggleExtra: (zonaId: string) => void;
}

const listaVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 },
  },
};

export default function PanelZonasExtra({
  zonas,
  zonasPromoIds,
  zonasExtraIds,
  onToggleExtra,
}: Props) {
  const reducirMovimiento = useReducedMotion();
  const disponibles = zonas.filter((z) => !zonasPromoIds.includes(z.id));

  if (disponibles.length === 0) return null;

  return (
    <motion.section
      initial={reducirMovimiento ? undefined : { opacity: 0, y: 14 }}
      animate={reducirMovimiento ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-[28px] border border-border bg-card/80 backdrop-blur-xl p-5 shadow-lg shadow-black/5 dark:shadow-black/20 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight tracking-tight text-foreground">
            Sumar zonas
          </h3>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Complementá tu promo con zonas extra
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary shadow-xs">
          10% off extra
        </span>
      </div>

      {/* Lista minimalista con micro-animaciones */}
      <motion.ul
        variants={reducirMovimiento ? undefined : listaVariants}
        initial={reducirMovimiento ? undefined : 'hidden'}
        animate={reducirMovimiento ? undefined : 'show'}
        className="mt-3.5 divide-y divide-border/60"
      >
        {disponibles.map((zona) => {
          const activa = zonasExtraIds.includes(zona.id);
          const precioConDesc = precioZonaExtraConDescuento(zona);

          return (
            <motion.li key={zona.id} variants={reducirMovimiento ? undefined : itemVariants}>
              <motion.button
                type="button"
                whileTap={reducirMovimiento ? undefined : { scale: 0.985 }}
                whileHover={reducirMovimiento ? undefined : { x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => onToggleExtra(zona.id)}
                aria-pressed={activa}
                className="flex w-full items-center gap-3.5 py-3.5 text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl px-1 hover:bg-accent/40"
              >
                <motion.span
                  aria-hidden
                  animate={
                    reducirMovimiento
                      ? undefined
                      : { scale: activa ? 1.08 : 1 }
                  }
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    activa
                      ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'border-border bg-background/80 text-muted-foreground'
                  }`}
                >
                  {activa ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </motion.span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-foreground">
                    {zona.nombre_zona}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                    {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-xs font-semibold tabular-nums text-muted-foreground line-through">
                    ${Number(zona.precio_lista).toLocaleString('es-AR')}
                  </span>
                  <span
                    className={`block text-base font-black tabular-nums tracking-tight ${
                      activa ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    ${Math.round(precioConDesc).toLocaleString('es-AR')}
                  </span>
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.section>
  );
}