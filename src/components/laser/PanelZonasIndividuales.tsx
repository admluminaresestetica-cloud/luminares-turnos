'use client';

import { Check, Plus } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonas: ServicioLaser[];
  seleccionadas: string[];
  onToggle: (zonaId: string) => void;
}

export default function PanelZonasIndividuales({ zonas, seleccionadas, onToggle }: Props) {
  if (zonas.length === 0) {
    return (
      <div className="rounded-[28px] border border-border bg-card p-8 text-center text-card-foreground">
        <p className="text-sm font-medium text-muted-foreground">
          No hay zonas disponibles para este perfil.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-border bg-card px-5 py-2 shadow-xs">
      <ul className="divide-y divide-border">
        {zonas.map((zona) => {
          const activa = seleccionadas.includes(zona.id);
          return (
            <li key={zona.id}>
              <button
                type="button"
                onClick={() => onToggle(zona.id)}
                aria-pressed={activa}
                className="flex w-full items-center gap-3.5 py-4 text-left transition-colors active:bg-accent/50 cursor-pointer"
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
                  <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                    {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
                  </span>
                </span>

                <span
                  className={`shrink-0 text-lg font-extrabold tabular-nums tracking-tight ${
                    activa ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  ${Number(zona.precio_lista).toLocaleString('es-AR')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
