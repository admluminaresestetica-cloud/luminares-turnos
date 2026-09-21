import Phaser from 'phaser';
import { Bubble } from './Bubble';

export class Shooter {
  private scene: Phaser.Scene;
  public currentBubble!: Bubble;
  private aimGraphics: Phaser.GameObjects.Graphics;
  private baseGraphics: Phaser.GameObjects.Graphics;
  public colors: number[];
  public x: number;
  public y: number;

  // Límite de racha repetida
  private lastColor: number | null = null;
  private sameColorCount: number = 0;
  private readonly maxStreak: number = 2; // Máximo 2 veces seguidas el mismo color

  constructor(scene: Phaser.Scene, x: number, y: number, colors: number[]) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.colors = colors;

    this.baseGraphics = scene.add.graphics();
    this.aimGraphics = scene.add.graphics();

    this.drawBase();
  }

  private drawBase() {
    this.baseGraphics.clear();
    this.baseGraphics.fillStyle(0x1e293b, 1);
    this.baseGraphics.fillCircle(this.x, this.y, 32);
    this.baseGraphics.lineStyle(3, 0x38bdf8, 0.8);
    this.baseGraphics.strokeCircle(this.x, this.y, 32);
  }

  /**
   * Genera la burbuja priorizando colores alcanzables y limitando repeticiones
   */
  public spawnBubble(
    activeBubbles: Bubble[] = [],
    remainingShots: number = 99,
    exposedColors: number[] = []
  ) {
    if (activeBubbles.length === 0) {
      const defaultColor = this.colors.length > 0 ? Phaser.Math.RND.pick(this.colors) : 0x38bdf8;
      this.currentBubble = new Bubble(this.scene, this.x, this.y, 22, defaultColor);
      return;
    }

    // 1. Usar colores expuestos si existen, de lo contrario los activos
    const candidateColors = exposedColors.length > 0
      ? exposedColors
      : Array.from(new Set(activeBubbles.map((b) => b.colorValue)));

    let chosenColor: number;

    // 2. Si quedan muy pocos tiros, priorizar el color con más presencia en los expuestos
    const isCriticalState = remainingShots <= candidateColors.length * 2 || remainingShots <= 4;

    if (isCriticalState) {
      const colorCounts: { [color: number]: number } = {};
      activeBubbles.forEach((b) => {
        if (candidateColors.includes(b.colorValue)) {
          colorCounts[b.colorValue] = (colorCounts[b.colorValue] || 0) + 1;
        }
      });
      const sortedByCount = candidateColors.sort((a, b) => (colorCounts[b] || 0) - (colorCounts[a] || 0));
      chosenColor = sortedByCount[0];
    } else {
      // 3. Selección normal controlando racha repetida
      chosenColor = Phaser.Math.RND.pick(candidateColors);

      if (chosenColor === this.lastColor) {
        this.sameColorCount++;
        if (this.sameColorCount >= this.maxStreak && candidateColors.length > 1) {
          const alternateColors = candidateColors.filter((c) => c !== this.lastColor);
          chosenColor = Phaser.Math.RND.pick(alternateColors);
          this.sameColorCount = 1;
        }
      } else {
        this.sameColorCount = 1;
      }
    }

    this.lastColor = chosenColor;
    this.currentBubble = new Bubble(this.scene, this.x, this.y, 22, chosenColor);
  }

  public drawAimLine(targetX: number, targetY: number) {
    this.aimGraphics.clear();
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    if (angle > -0.15 && angle < Math.PI + 0.15) return;

    this.aimGraphics.lineStyle(3, 0x38bdf8, 0.6);
    const length = 400;
    const steps = 20;

    for (let i = 0; i < steps; i += 2) {
      const px1 = this.x + Math.cos(angle) * (length / steps) * i;
      const py1 = this.y + Math.sin(angle) * (length / steps) * i;
      const px2 = this.x + Math.cos(angle) * (length / steps) * (i + 1);
      const py2 = this.y + Math.sin(angle) * (length / steps) * (i + 1);

      this.aimGraphics.lineBetween(px1, py1, px2, py2);
    }
  }

  public clearAim() {
    this.aimGraphics.clear();
  }

  public shoot(targetX: number, targetY: number): Bubble | null {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

    if (angle > -0.15 && angle < Math.PI + 0.15) return null;

    this.clearAim();

    const bubble = this.currentBubble;
    const body = bubble.body as Phaser.Physics.Arcade.Body;
    const speed = 650;

    body.setCollideWorldBounds(true);
    body.setBounce(1, 1);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    return bubble;
  }
}