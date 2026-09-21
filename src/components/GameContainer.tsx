import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/scenes/MainScene';
import { GameHUD } from './GameHUD';

interface GameContainerProps {
  levelId: number;
  onGoToMap: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ levelId, onGoToMap }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

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

    const newGame = new Phaser.Game(config);

    newGame.events.once(Phaser.Core.Events.READY, () => {
      newGame.scene.start('MainScene', { levelId });
    });

    setGameInstance(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, [levelId]);

  return (
    <div className="relative w-[360px] h-[740px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
      {/* Phaser Canvas en el fondo */}
      <div ref={gameRef} className="absolute inset-0 z-0" />

      {/* Capa UI de React arriba */}
      <GameHUD
        game={gameInstance}
        onGoToMap={onGoToMap}
        onRestartLevel={() => {
          if (gameInstance) {
            gameInstance.scene.stop('MainScene');
            gameInstance.scene.start('MainScene', { levelId });
          }
        }}
        onNextLevel={() => {
          if (gameInstance) {
            gameInstance.scene.stop('MainScene');
            gameInstance.scene.start('MainScene', { levelId: levelId + 1 });
          }
        }}
      />
    </div>
  );
};