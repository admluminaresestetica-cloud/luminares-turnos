import React from 'react';

interface LevelMapProps {
  unlockedLevel: number;
  levelStars: { [key: number]: number };
  onSelectLevel: (levelId: number) => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ unlockedLevel, levelStars, onSelectLevel }) => {
  const totalLevels = 5;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-3xl font-extrabold mb-8 text-sky-400 drop-shadow">Saga de Niveles</h1>

      <div className="relative flex flex-col gap-10 items-center w-full max-w-xs">
        {Array.from({ length: totalLevels }).map((_, idx) => {
          const levelId = idx + 1;
          const isUnlocked = levelId <= unlockedLevel;
          const stars = levelStars[levelId] || 0;

          // Zigzag horizontal para dar efecto de camino sinuoso
          const offsetX = idx % 2 === 0 ? 'translate-x-8' : '-translate-x-8';

          return (
            <div key={levelId} className={`relative flex flex-col items-center ${offsetX}`}>
              <button
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(levelId)}
                className={`w-16 h-16 rounded-full font-bold text-xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 ring-4 ring-yellow-200'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? levelId : '🔒'}
              </button>

              {/* Estrellas del nivel */}
              {isUnlocked && (
                <div className="flex gap-1 mt-1 text-xs text-yellow-300">
                  {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};