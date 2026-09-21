import { Bubble } from '../objects/Bubble';
import { GridManager } from './GridManager';

export class MatchSystem {
  private gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  public getNeighbors(row: number, col: number): { row: number; col: number }[] {
    const isOdd = row % 2 === 1;

    // Offsets exactos para grilla desplazada (Odd-r layout)
    const offsets = isOdd
      ? [
          { r: -1, c: 0 }, { r: -1, c: 1 },
          { r: 0, c: -1 }, { r: 0, c: 1 },
          { r: 1, c: 0 },  { r: 1, c: 1 }
        ]
      : [
          { r: -1, c: -1 }, { r: -1, c: 0 },
          { r: 0, c: -1 },  { r: 0, c: 1 },
          { r: 1, c: -1 },  { r: 1, c: 0 }
        ];

    const neighbors: { row: number; col: number }[] = [];

    for (const off of offsets) {
      const r = row + off.r;
      const c = col + off.c;

      if (r >= 0 && r < this.gridManager.rows) {
        const maxCols = r % 2 === 1 ? this.gridManager.cols - 1 : this.gridManager.cols;
        if (c >= 0 && c < maxCols) {
          if (this.gridManager.grid[r][c] !== null) {
            neighbors.push({ row: r, col: c });
          }
        }
      }
    }

    return neighbors;
  }

  public checkMatches(startRow: number, startCol: number): Bubble[] {
    const targetBubble = this.gridManager.grid[startRow][startCol];
    if (!targetBubble) return [];

    const targetColor = targetBubble.colorValue;
    const matches: Bubble[] = [];
    const visited = new Set<string>();
    const queue: { row: number; col: number }[] = [{ row: startRow, col: startCol }];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const key = `${curr.row},${curr.col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const currentBubble = this.gridManager.grid[curr.row][curr.col];
      if (currentBubble && currentBubble.colorValue === targetColor) {
        matches.push(currentBubble);

        const neighbors = this.getNeighbors(curr.row, curr.col);
        for (const n of neighbors) {
          if (!visited.has(`${n.row},${n.col}`)) {
            queue.push(n);
          }
        }
      }
    }

    return matches.length >= 3 ? matches : [];
  }

  public findFloatingOrphans(): Bubble[] {
    const connectedToCeiling = new Set<string>();
    const queue: { row: number; col: number }[] = [];

    for (let c = 0; c < this.gridManager.cols; c++) {
      if (this.gridManager.grid[0][c] !== null) {
        queue.push({ row: 0, col: c });
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const key = `${curr.row},${curr.col}`;

      if (connectedToCeiling.has(key)) continue;
      connectedToCeiling.add(key);

      const neighbors = this.getNeighbors(curr.row, curr.col);
      for (const n of neighbors) {
        if (!connectedToCeiling.has(`${n.row},${n.col}`)) {
          queue.push(n);
        }
      }
    }

    const orphans: Bubble[] = [];
    for (let r = 0; r < this.gridManager.rows; r++) {
      const maxCols = r % 2 === 1 ? this.gridManager.cols - 1 : this.gridManager.cols;
      for (let c = 0; c < maxCols; c++) {
        const bubble = this.gridManager.grid[r][c];
        if (bubble && !connectedToCeiling.has(`${r},${c}`)) {
          orphans.push(bubble);
        }
      }
    }

    return orphans;
  }
}