import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';

interface GameHUDProps {
  game: Phaser.Game | null;
  onRestartLevel: () => void;
  onGoToMap: () => void;
  onNextLevel: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  game,
  onRestartLevel,
  onGoToMap,
  onNextLevel,
}) => {
  const [shots, setShots] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'WIN' | 'LOSE'>('PLAYING');

  useEffect(() => {
    if (!game) return;

    // Escuchar actualizaciones de tiros y puntos desde MainScene
    const handleUpdateHUD = (data: { shots: number; score: number }) => {
      setShots(data.shots);
      setScore(data.score);
    };

    const handleWin = () => setGameState('WIN');
    const handleLose = () => setGameState('LOSE');

    game.events.on('UPDATE_HUD', handleUpdateHUD);
    game.events.on('LEVEL_WIN', handleWin);
    game.events.on('LEVEL_LOSE', handleLose);

    return () => {
      game.events.off('UPDATE_HUD', handleUpdateHUD);
      game.events.off('LEVEL_WIN', handleWin);
      game.events.off('LEVEL_LOSE', handleLose);
    };
  }, [game]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* Barra Superior (HUD) */}
      <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/50 text-white shadow-lg pointer-events-auto">
        <button
          onClick={onGoToMap}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-semibold"
        >
          🗺️ Mapa
        </button>

        <div className="flex gap-4 text-sm font-bold">
          <div>
            Puntos: <span className="text-amber-400">{score}</span>
          </div>
          <div>
            Tiros: <span className="text-sky-400">{shots}</span>
          </div>
        </div>
      </div>

      {/* Modal de VICTORIA */}
      {gameState === 'WIN' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-black text-amber-400 mb-1">¡NIVEL COMPLETADO!</h2>
            <p className="text-slate-300 text-sm mb-4">Puntaje final: {score}</p>

            <div className="flex gap-2 justify-center mb-6 text-3xl text-yellow-300">
              ★ ★ ★
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onNextLevel}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg active:scale-95 transition"
              >
                Siguiente Nivel
              </button>
              <button
                onClick={onRestartLevel}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de DERROTA */}
      {gameState === 'LOSE' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-black text-rose-500 mb-1">¡SIN TIROS!</h2>
            <p className="text-slate-300 text-sm mb-6">Te quedaste sin burbujas disponibles.</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={onRestartLevel}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg active:scale-95 transition"
              >
                Reintentar
              </button>
              <button
                onClick={onGoToMap}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition"
              >
                Volver al Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};