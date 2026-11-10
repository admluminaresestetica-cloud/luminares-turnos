'use client';

import { Star, Gift, Trophy } from 'lucide-react';

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
  // 📊 Lógica simple para calcular niveles y progreso
  // Nivel 1 (Inicial): 0 - 50 pts | Nivel 2 (Bronce): 50 - 150 pts | Nivel 3 (Plata): 150+ pts
  let nivelNombre = 'Nivel Inicial';
  let puntosSiguienteNivel = 50;
  let puntosMinimosNivel = 0;

  if (puntosTotales >= 150) {
    nivelNombre = 'Nivel Plata 🥈';
    puntosSiguienteNivel = 300;
    puntosMinimosNivel = 150;
  } else if (puntosTotales >= 50) {
    nivelNombre = 'Nivel Bronce 🥉';
    puntosSiguienteNivel = 150;
    puntosMinimosNivel = 50;
  }

  // Cálculo del porcentaje de progreso para la barra (0% a 100%)
  const puntosEnNivelActual = puntosTotales - puntosMinimosNivel;
  const rangoNivel = puntosSiguienteNivel - puntosMinimosNivel;
  const porcentajeProgreso = Math.min(
    Math.max((puntosEnNivelActual / rangoNivel) * 100, 0),
    100
  );

  return (
    <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary" /> Puntos Luminares
          </span>
          <p className="text-xl font-black text-foreground leading-none pt-0.5">
            {cargandoPuntos ? (
              <span className="text-xs font-normal text-muted-foreground animate-pulse">Cargando...</span>
            ) : (
              `${puntosTotales} pts`
            )}
          </p>
        </div>

        <div className="px-3 py-1 bg-primary/20 rounded-xl text-[10px] font-extrabold text-primary flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          <span>{nivelNombre}</span>
        </div>
      </div>

      {/* 📈 BARRA DE PROGRESO DINÁMICA */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
          <span>Progreso de nivel</span>
          <span>{puntosTotales} / {puntosSiguienteNivel} pts</span>
        </div>
        <div className="w-full h-2 bg-background/60 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-primary/10">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${porcentajeProgreso}%` }}
          />
        </div>
      </div>

      {/* Botón para abrir el Catálogo de Canjes */}
      <button
        type="button"
        onClick={onAbrirCanje}
        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
      >
        <Gift className="w-3.5 h-3.5" />
        <span>Canjear por Premios</span>
      </button>
    </div>
  );
}
