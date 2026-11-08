'use client';

import { Lightbulb, ArrowRight, X } from 'lucide-react';
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
  return (
    <aside className="rounded-[28px] border border-primary/20 bg-primary/10 p-5">
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Lightbulb className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold leading-tight tracking-tight text-foreground">
              Con un combo pagás menos
            </h3>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Descartar aviso"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-background/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted-foreground">
            Tus zonas equivalen a <strong className="font-bold text-foreground">{promo.nombre_promo}</strong>.
          </p>

          {/* Comparación de precios */}
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-2xl font-black tabular-nums tracking-tight text-foreground">
              {formatPrecio(promo.precio_promo)}
            </span>
            <span className="text-sm font-semibold tabular-nums text-muted-foreground line-through">
              {formatPrecio(precioIndividual)}
            </span>
          </div>
          {ahorro > 0 && (
            <p className="mt-0.5 text-sm font-bold text-primary">Ahorrás {formatPrecio(ahorro)}</p>
          )}

          <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            <button
              type="button"
              onClick={onAplicarPromo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground transition-all active:scale-95 cursor-pointer"
            >
              <span>Aplicar combo</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground active:bg-background/60 cursor-pointer"
            >
              Mantener zonas sueltas
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
