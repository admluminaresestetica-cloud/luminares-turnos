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
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Sumar zonas adicionales</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Elegí zonas extras para complementar tu promo
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
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
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                activa
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card text-card-foreground hover:border-muted-foreground/30 hover:bg-accent/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  activa
                    ? 'border-primary-foreground bg-primary-foreground text-primary'
                    : 'border-muted-foreground/30 bg-background text-transparent'
                }`}
              >
                {activa ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Plus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${activa ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {zona.nombre_zona}
                </p>
                <p className={`text-[11px] ${activa ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-[11px] line-through ${activa ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  ${Number(zona.precio_lista).toLocaleString('es-AR')}
                </p>
                <p className={`text-xs font-bold ${activa ? 'text-primary-foreground' : 'text-foreground'}`}>
                  ${Math.round(precioConDesc).toLocaleString('es-AR')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}