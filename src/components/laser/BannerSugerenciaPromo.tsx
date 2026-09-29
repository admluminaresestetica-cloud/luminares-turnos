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

export default function BannerSugerenciaPromo({
  promo,
  ahorro,
  precioIndividual,
  onAplicarPromo,
  onDismiss,
}: Props) {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 shadow-2xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-primary/15 text-primary rounded-xl shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-primary text-xs uppercase tracking-wider">
              ¡Sugerencia de ahorro!
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-lg transition-colors"
              title="Descartar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-foreground mt-1 leading-relaxed">
            Las zonas elegidas equivalen al combo <strong className="font-semibold text-foreground">{promo.nombre_promo}</strong>. 
            Pagás <span className="font-bold">${Number(promo.precio_promo).toLocaleString()}</span> en lugar de ${precioIndividual.toLocaleString()}
            {ahorro > 0 && (
              <span className="font-bold text-primary"> (ahorrás ${ahorro.toLocaleString()})</span>
            )}.
          </p>

          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              type="button"
              onClick={onAplicarPromo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3.5 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
            >
              <span>Aplicar promocional</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-muted transition-colors"
            >
              Mantener zonas sueltas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}