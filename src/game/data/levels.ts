export interface LevelConfig {
  id: number;
  maxShots: number;
  rows: number;
  cols: number;
  initialGrid: number[][]; // IDs de colores o -1 para vacío
  targetStars: { star1: number; star2: number; star3: number };
}

// Mapeo de IDs a colores
export const COLOR_MAP: { [key: number]: number } = {
  0: 0x38bdf8, // Azul
  1: 0xf43f5e, // Rojo
  2: 0x10b981, // Verde
  3: 0xf59e0b, // Naranja
  4: 0xa855f7  // Violeta
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    maxShots: 12,
    rows: 4,
    cols: 8,
    initialGrid: [
      [0, 0, 1, 1, 2, 2, 3, 3],
      [0, 1, 1, 2, 2, 3],
      [1, 1, 2, 2, 3, 3, 0, 0],
      [1, 2, 2, 3, 3, 0]
    ],
    targetStars: { star1: 500, star2: 1000, star3: 1500 }
  },
  {
    id: 2,
    maxShots: 10,
    rows: 5,
    cols: 8,
    initialGrid: [
      [4, 4, 1, 1, 0, 0, 2, 2],
      [4, 1, 1, 0, 0, 2],
      [1, 1, 3, 3, 4, 4, 2, 2],
      [1, 3, 3, 4, 4, 2],
      [0, 0, 1, 1, 2, 2, 3, 3]
    ],
    targetStars: { star1: 800, star2: 1400, star3: 2000 }
  }
];