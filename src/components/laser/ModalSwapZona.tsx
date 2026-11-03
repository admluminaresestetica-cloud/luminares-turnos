'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonaOriginal: ServicioLaser;
  opciones: ServicioLaser[];
  onSelect: (nuevaZonaId: string) => void;
  onClose: () => void;
}

/**
 * Modal centrado y flotante.
 * - En mobile se centra en el espacio libre sobre la navegación inferior de la app
 *   (alto definido por --bottom-nav-h, por defecto 4rem, más el safe-area).
 * - La lista tiene scroll interno: el cuadro nunca supera la pantalla.
 */
export default function ModalSwapZona({ zonaOriginal, opciones, onSelect, onClose }: Props) {
  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 pb-[calc(var(--bottom-nav-h,4rem)+env(safe-area-inset-bottom,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] backdrop-blur-[2px] animate-in fade-in duration-200 sm:pb-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Intercambiar zona"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-[20px] border border-border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:max-h-[85dvh]"
      >
        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-all active:scale-90 cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Encabezado (fijo) */}
        <div className="shrink-0 px-5 pb-3 pr-14 pt-5">
          <h3 className="text-xl font-extrabold leading-tight tracking-tight text-foreground">
            Intercambiar zona
          </h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted-foreground">
            Reemplazá <strong className="font-bold text-foreground">{zonaOriginal.nombre_zona}</strong>{' '}
            por otra zona{' '}
            <span className="font-bold text-foreground">
              {ETIQUETA_CATEGORIA[zonaOriginal.categoria_zona]}
            </span>{' '}
            de igual categoría.
          </p>
        </div>

        {/* Lista con scroll interno */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          {opciones.length === 0 ? (
            <p className="border-t border-border py-10 text-center text-sm font-medium text-muted-foreground">
              No hay zonas equivalentes disponibles para realizar el intercambio.
            </p>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {opciones.map((zona) => (
                <li key={zona.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(zona.id)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors active:bg-accent/50 cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {zona.nombre_zona}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                        {zona.duracion_minutos} min
                      </span>
                    </span>
                    <span className="shrink-0 text-lg font-extrabold tabular-nums tracking-tight text-foreground">
                      ${Number(zona.precio_lista).toLocaleString('es-AR')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
