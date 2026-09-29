'use client';

import { X, ArrowRightLeft } from 'lucide-react';
import type { ServicioLaser } from '@/lib/types';
import { ETIQUETA_CATEGORIA } from '@/lib/laser/calculos';

interface Props {
  zonaOriginal: ServicioLaser;
  opciones: ServicioLaser[];
  onSelect: (nuevaZonaId: string) => void;
  onClose: () => void;
}

export default function ModalSwapZona({ zonaOriginal, opciones, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col border border-border overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/40">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-muted rounded-lg text-foreground">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-foreground text-base">Intercambiar zona</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Reemplazá <strong className="font-semibold text-foreground">{zonaOriginal.nombre_zona}</strong> por otra zona{' '}
                <span className="font-semibold text-foreground">
                  {ETIQUETA_CATEGORIA[zonaOriginal.categoria_zona]}
                </span>{' '}
                de igual categoría.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Opciones */}
        <div className="overflow-y-auto p-4 space-y-2">
          {opciones.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-muted-foreground text-xs font-medium">
                No hay zonas equivalentes disponibles para realizar el intercambio.
              </p>
            </div>
          ) : (
            opciones.map((zona) => (
              <button
                key={zona.id}
                type="button"
                onClick={() => onSelect(zona.id)}
                className="w-full flex justify-between items-center p-3.5 rounded-xl border border-border hover:border-primary hover:bg-accent/50 text-left transition-all group shadow-sm cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-accent-foreground">
                    {zona.nombre_zona}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {zona.duracion_minutos} min
                  </p>
                </div>
                <p className="text-xs font-bold text-foreground">
                  ${Number(zona.precio_lista).toLocaleString('es-AR')}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer opcional de cierre */}
        <div className="p-3 bg-muted/40 border-t border-border text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}