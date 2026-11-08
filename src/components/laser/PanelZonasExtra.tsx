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
    <section className="rounded-[28px] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold leading-tight tracking-tight text-foreground">
            Sumar zonas
          </h3>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Complementá tu promo con zonas extra
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          10% off extra
        </span>
      </div>

      {/* Lista minimalista, sin cajas por zona */}
      <ul className="mt-3 divide-y divide-border">
        {disponibles.map((zona) => {
          const activa = zonasExtraIds.includes(zona.id);
          const precioConDesc = precioZonaExtraConDescuento(zona);

          return (
            <li key={zona.id}>
              <button
                type="button"
                onClick={() => onToggleExtra(zona.id)}
                aria-pressed={activa}
                className="flex w-full items-center gap-3.5 py-3.5 text-left transition-colors active:bg-accent/50 cursor-pointer"
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    activa
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {activa ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {zona.nombre_zona}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-xs font-medium tabular-nums text-muted-foreground line-through">
                    ${Number(zona.precio_lista).toLocaleString('es-AR')}
                  </span>
                  <span
                    className={`block text-base font-extrabold tabular-nums tracking-tight ${
                      activa ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    ${Math.round(precioConDesc).toLocaleString('es-AR')}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
