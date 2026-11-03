'use client';

import { Clock, ArrowRight } from 'lucide-react';

interface Props {
  precio: number;
  duracion: number;
  puedeContinuar: boolean;
  onContinuar: () => void;
  detalle?: string;
}

/**
 * En mobile se apoya un poco por encima de la navegación inferior de la app.
 * Alto de esa navegación: variable CSS --bottom-nav-h (por defecto 4rem = h-16) + margen adicional de 0.75rem.
 * Más el safe-area del celular, para no encimarse con la barra de gestos.
 */
export default function BarraFlotanteLaser({
  precio,
  duracion,
  puedeContinuar,
  onContinuar,
  detalle,
}: Props) {
  const visible = precio > 0 || duracion > 0;
  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 z-40 bottom-[calc(var(--bottom-nav-h,4rem)+env(safe-area-inset-bottom,0px)+0.75rem)] sm:bottom-0 sm:pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto max-w-3xl">
        <div className="bg-card text-card-foreground border-t border-border rounded-t-[28px] px-5 pt-4 pb-4 sm:px-6 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]">
          {detalle && (
            <p className="mb-2 truncate text-xs font-medium text-muted-foreground">{detalle}</p>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-black leading-none tabular-nums tracking-tight text-foreground">
                ${precio.toLocaleString('es-AR')}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {duracion} min
              </span>
            </div>

            <button
              type="button"
              onClick={onContinuar}
              disabled={!puedeContinuar}
              className="shrink-0 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-extrabold text-primary-foreground transition-all active:scale-95 disabled:bg-muted disabled:text-muted-foreground cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
