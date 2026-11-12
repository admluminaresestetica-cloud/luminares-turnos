'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Lightbulb, ArrowRight, X, Sparkles } from 'lucide-react';
import type { PromoLaser } from '@/lib/types';

interface Props {
  promo: PromoLaser;
  ahorro: number;
  precioIndividual: number;
  onAplicarPromo: () => void;
  onDismiss: () => void;
}

const formatPrecio = (n: number) => `$${Number(n).toLocaleString('es-AR')}`;

export default function BannerSugerenciaPromo({
  promo,
  ahorro,
  precioIndividual,
  onAplicarPromo,
  onDismiss,
}: Props) {
  const reducirMovimiento = useReducedMotion();

  return (
    <motion.aside
      initial={reducirMovimiento ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
      animate={reducirMovimiento ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={reducirMovimiento ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="relative rounded-[28px] border border-primary/30 bg-primary/10 backdrop-blur-xl p-5 shadow-xl shadow-primary/10 overflow-hidden"
    >
      {/* Resplandor interno dinámico */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent"
      />

      <div className="relative z-10 flex items-start gap-3.5">
        <motion.div
          animate={reducirMovimiento ? undefined : { rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-primary text-primary-foreground shadow-md shadow-primary/30"
        >
          <Lightbulb className="h-5 w-5 fill-primary-foreground/20" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-primary mb-0.5">
                <Sparkles className="w-3 h-3" /> Recomendación inteligente
              </span>
              <h3 className="text-base font-black leading-tight tracking-tight text-foreground">
                Con un combo pagás menos
              </h3>
            </div>
            <motion.button
              type="button"
              whileTap={reducirMovimiento ? undefined : { scale: 0.9 }}
              whileHover={reducirMovimiento ? undefined : { scale: 1.1 }}
              onClick={onDismiss}
              aria-label="Descartar aviso"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
            Tus zonas equivalen a <strong className="font-extrabold text-foreground">{promo.nombre_promo}</strong>.
          </p>

          {/* Comparación de precios con relieve */}
          <div className="mt-3 flex items-baseline gap-3 rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-md px-3.5 py-2.5">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Precio combo
              </span>
              <span className="text-2xl font-black tabular-nums tracking-tight text-primary">
                {formatPrecio(promo.precio_promo)}
              </span>
            </div>
            <div className="border-l border-border/80 pl-3">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Precio suelto
              </span>
              <span className="text-sm font-bold tabular-nums text-muted-foreground line-through">
                {formatPrecio(precioIndividual)}
              </span>
            </div>
          </div>

          {ahorro > 0 && (
            <motion.p
              initial={reducirMovimiento ? undefined : { opacity: 0, x: -6 }}
              animate={reducirMovimiento ? undefined : { opacity: 1, x: 0 }}
              className="mt-2 text-xs font-black tracking-tight text-primary flex items-center gap-1"
            >
               ¡Ahorrás {formatPrecio(ahorro)} en total!
            </motion.p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              whileTap={reducirMovimiento ? undefined : { scale: 0.97 }}
              whileHover={reducirMovimiento ? undefined : { scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={onAplicarPromo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/30 transition-colors cursor-pointer"
            >
              <span>Aplicar combo</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={reducirMovimiento ? undefined : { scale: 0.97 }}
              onClick={onDismiss}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/80 bg-background/60 hover:bg-background px-5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground cursor-pointer shadow-xs"
            >
              Mantener zonas sueltas
            </motion.button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}