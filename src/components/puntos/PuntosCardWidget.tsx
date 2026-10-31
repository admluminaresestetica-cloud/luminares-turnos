'use client';

import { Star, Gift } from 'lucide-react';

interface PuntosCardWidgetProps {
  puntosTotales: number;
  cargandoPuntos: boolean;
  onAbrirCanje: () => void;
}

export default function PuntosCardWidget({
  puntosTotales,
  cargandoPuntos,
  onAbrirCanje,
}: PuntosCardWidgetProps) {
  return (
    <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
            <Star className="w-3 h-3" /> Puntos Luminares
          </span>
          <p className="text-base font-black text-foreground leading-none">
            {cargandoPuntos ? (
              <span className="text-xs font-normal text-muted-foreground animate-pulse">Cargando...</span>
            ) : (
              `${puntosTotales} pts`
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">Acumulá puntos en cada visita o compra</p>
        </div>
        <div className="px-2.5 py-1 bg-primary/20 rounded-xl text-[10px] font-bold text-primary">
          Nivel Inicial
        </div>
      </div>

      {/* Botón para abrir el Catálogo de Canjes (Etapa 3) */}
      <button
        type="button"
        onClick={onAbrirCanje}
        className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
      >
        <Gift className="w-3.5 h-3.5" />
        <span>Canjear por Premios</span>
      </button>
    </div>
  );
}
