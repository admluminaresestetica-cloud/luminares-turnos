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
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center text-card-foreground">
        <p className="text-muted-foreground text-sm font-medium">
          No hay zonas disponibles para este perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
      {zonas.map((zona) => {
        const activa = seleccionadas.includes(zona.id);
        return (
          <button
            key={zona.id}
            type="button"
            onClick={() => onToggle(zona.id)}
            className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
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
              <p className={`text-xs sm:text-sm font-bold truncate ${activa ? 'text-primary-foreground' : 'text-foreground'}`}>
                {zona.nombre_zona}
              </p>
              <p className={`text-[11px] sm:text-xs truncate ${activa ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {ETIQUETA_CATEGORIA[zona.categoria_zona]} · {zona.duracion_minutos} min
              </p>
            </div>

            <p className={`text-xs sm:text-sm font-bold shrink-0 ${activa ? 'text-primary-foreground' : 'text-foreground'}`}>
              ${Number(zona.precio_lista).toLocaleString('es-AR')}
            </p>
          </button>
        );
      })}
    </div>
  );
}