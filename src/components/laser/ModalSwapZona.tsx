'use client';

import { X } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonaOriginal: ServicioLaser;
  opciones: ServicioLaser[];
  onSelect: (nuevaZonaId: string) => void;
  onClose: () => void;
}

/** Bottom sheet en mobile, diálogo centrado en pantallas grandes. */
export default function ModalSwapZona({ zonaOriginal, opciones, onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Intercambiar zona"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border border-border bg-card text-card-foreground shadow-2xl animate-in slide-in-from-bottom-6 duration-200 sm:rounded-[28px]"
      >
        {/* Asa del sheet (solo mobile) */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:pt-5">
          <div className="min-w-0">
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

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Opciones: lista simple */}
        <div className="overflow-y-auto px-5">
          {opciones.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-muted-foreground">
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

        {/* Cancelar, respetando la barra de gestos */}
        <div
          className="px-5 pt-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
