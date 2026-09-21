'use client';

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from '@/game/scenes/MainScene';
import { LevelMap } from '@/components/LevelMap';

export default function BubbleGameWrapper() {
  const [screen, setScreen] = useState<'MAP' | 'GAME'>('GAME');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [shots, setShots] = useState<number>(12);
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'WIN' | 'LOSE'>('PLAYING');

  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (screen !== 'GAME' || !gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 360,
      height: 740,
      backgroundColor: '#0b1329',
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: [MainScene]
    };

    const game = new Phaser.Game(config);
    gameInstance.current = game;

    game.events.once(Phaser.Core.Events.READY, () => {
      game.scene.start('MainScene', { levelId: currentLevel });
    });

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
      game.destroy(true);
    };
  }, [screen, currentLevel]);

  const restartLevel = () => {
    setGameState('PLAYING');
    if (gameInstance.current) {
      gameInstance.current.scene.stop('MainScene');
      gameInstance.current.scene.start('MainScene', { levelId: currentLevel });
    }
  };

  if (screen === 'MAP') {
    return (
      <LevelMap
        unlockedLevel={currentLevel}
        levelStars={{ 1: 3 }}
        onSelectLevel={(lvl) => {
          setCurrentLevel(lvl);
          setGameState('PLAYING');
          setScreen('GAME');
        }}
      />
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-2">
      {/* Contenedor del Juego */}
      <div className="relative w-[360px] h-[740px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
        
        {/* 1. Canvas de Phaser */}
        <div ref={gameRef} className="absolute inset-0 z-0" />

        {/* 2. Barra Superior (HUD) */}
        <div className="absolute top-0 left-0 right-0 z-10 p-3 pointer-events-none">
          <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 text-white shadow-lg pointer-events-auto">
            <button
              onClick={() => setScreen('MAP')}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-semibold text-slate-200"
            >
              🗺️ Mapa
            </button>

            <div className="flex gap-4 text-xs font-bold">
              <div>Puntos: <span className="text-amber-400">{score}</span></div>
              <div>Tiros: <span className="text-sky-400">{shots}</span></div>
            </div>
          </div>
        </div>

        {/* 3. Cartel de Victoria */}
        {gameState === 'WIN' && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
              <h2 className="text-2xl font-black text-amber-400 mb-1">¡NIVEL COMPLETADO!</h2>
              <p className="text-slate-300 text-xs mb-4">Puntaje final: {score}</p>
              <div className="text-2xl text-yellow-300 mb-6">★ ★ ★</div>
              
              <button
                onClick={() => {
                  setCurrentLevel(prev => prev + 1);
                  restartLevel();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold py-3 rounded-xl mb-2 shadow-lg"
              >
                Siguiente Nivel
              </button>
              <button
                onClick={() => setScreen('MAP')}
                className="w-full bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs"
              >
                Volver al Mapa
              </button>
            </div>
          </div>
        )}

        {/* 4. Cartel de Derrota */}
        {gameState === 'LOSE' && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
              <h2 className="text-2xl font-black text-rose-500 mb-1">¡SIN TIROS!</h2>
              <p className="text-slate-300 text-xs mb-6">Te quedaste sin burbujas disponibles.</p>
              
              <button
                onClick={restartLevel}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold py-3 rounded-xl mb-2 shadow-lg"
              >
                Reintentar
              </button>
              <button
                onClick={() => setScreen('MAP')}
                className="w-full bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs"
              >
                Volver al Mapa
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}