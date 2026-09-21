import Phaser from 'phaser';
import { Bubble } from '../objects/Bubble';

export class GridManager {
  private scene: Phaser.Scene;
  public readonly rows: number = 11;
  public readonly cols: number = 8;
  public readonly bubbleRadius: number = 22;
  public grid: (Bubble | null)[][];
  public startX: number = 38;
  public startY: number = 60;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  /**
   * Devuelve un arreglo con todas las burbujas activas en el tablero
   */
  public getActiveBubbles(): Bubble[] {
    const activeBubbles: Bubble[] = [];
    for (let r = 0; r < this.rows; r++) {
      const maxCols = r % 2 === 1 ? this.cols - 1 : this.cols;
      for (let c = 0; c < maxCols; c++) {
        const bubble = this.grid[r][c];
        if (bubble) {
          activeBubbles.push(bubble);
        }
      }
    }
    return activeBubbles;
  }

  /**
   * Devuelve SOLO los colores de las burbujas que están al frente / expuestas
   * y que el tiro del jugador realmente puede impactar.
   */
  public getExposedBubbleColors(): number[] {
    const exposedColors = new Set<number>();

    for (let r = 0; r < this.rows; r++) {
      const maxCols = r % 2 === 1 ? this.cols - 1 : this.cols;
      for (let c = 0; c < maxCols; c++) {
        const bubble = this.grid[r][c];
        if (bubble) {
          const neighbors = this.getNeighbors(r, c);

          // Una burbuja está expuesta si tiene espacio libre debajo/a los lados o está en la fila base
          const hasEmptySlotBelow = neighbors.some(
            (n) => n.row >= r && this.grid[n.row][n.col] === null
          );

          if (hasEmptySlotBelow || r === this.rows - 1) {
            exposedColors.add(bubble.colorValue);
          }
        }
      }
    }

    // Si por alguna razón no detecta ninguna, usa el fallback de todas las activas
    if (exposedColors.size === 0) {
      this.getActiveBubbles().forEach((b) => exposedColors.add(b.colorValue));
    }

    return Array.from(exposedColors);
  }

  public getBubblePosition(row: number, col: number): { x: number; y: number } {
    const isOdd = row % 2 === 1;
    const xOffset = isOdd ? this.bubbleRadius : 0;
    const x = this.startX + col * (this.bubbleRadius * 2) + xOffset;
    const y = this.startY + row * (this.bubbleRadius * 1.732);
    return { x, y };
  }

  private getNeighbors(row: number, col: number): { row: number; col: number }[] {
    const isOdd = row % 2 === 1;
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

    const validSlots: { row: number; col: number }[] = [];

    for (const off of offsets) {
      const r = row + off.r;
      const c = col + off.c;

      if (r >= 0 && r < this.rows) {
        const maxCols = r % 2 === 1 ? this.cols - 1 : this.cols;
        if (c >= 0 && c < maxCols) {
          validSlots.push({ row: r, col: c });
        }
      }
    }

    return validSlots;
  }

  public snapToGrid(bubble: Bubble, hitBubble?: Bubble): { row: number; col: number } {
    let candidateSlots: { row: number; col: number }[] = [];

    if (hitBubble && hitBubble.gridRow !== undefined && hitBubble.gridCol !== undefined) {
      const neighbors = this.getNeighbors(hitBubble.gridRow, hitBubble.gridCol);
      candidateSlots = neighbors.filter((slot) => this.grid[slot.row][slot.col] === null);
    }

    if (candidateSlots.length === 0) {
      for (let r = 0; r < this.rows; r++) {
        const maxCols = r % 2 === 1 ? this.cols - 1 : this.cols;
        for (let c = 0; c < maxCols; c++) {
          if (this.grid[r][c] === null) {
            candidateSlots.push({ row: r, col: c });
          }
        }
      }
    }

    let closestRow = 0;
    let closestCol = 0;
    let minDistance = Infinity;

    for (const slot of candidateSlots) {
      const pos = this.getBubblePosition(slot.row, slot.col);
      const dist = Phaser.Math.Distance.Between(bubble.x, bubble.y, pos.x, pos.y);

      if (dist < minDistance) {
        minDistance = dist;
        closestRow = slot.row;
        closestCol = slot.col;
      }
    }

    const finalPos = this.getBubblePosition(closestRow, closestCol);
    bubble.setPosition(finalPos.x, finalPos.y);
    bubble.setGridPosition(closestRow, closestCol);

    this.grid[closestRow][closestCol] = bubble;
    return { row: closestRow, col: closestCol };
  }
}