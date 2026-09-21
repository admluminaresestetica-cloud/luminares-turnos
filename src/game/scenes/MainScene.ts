import Phaser from 'phaser';
import { GridManager } from '../logic/GridManager';
import { MatchSystem } from '../logic/MatchSystem';
import { Shooter } from '../objects/Shooter';
import { Bubble } from '../objects/Bubble';
import { LEVELS, COLOR_MAP, LevelConfig } from '../data/levels';

export class MainScene extends Phaser.Scene {
  private gridManager!: GridManager;
  private matchSystem!: MatchSystem;
  private shooter!: Shooter;

  private activeBubble: Bubble | null = null;
  private isAiming: boolean = false;
  private canShoot: boolean = true;
  private colors: number[] = [0x38bdf8, 0xf43f5e, 0x10b981, 0xf59e0b, 0xa855f7];

  private currentLevelData!: LevelConfig;
  private remainingShots: number = 0;
  private score: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  public init(data: { levelId?: number }) {
    const levelId = data.levelId || 1;
    this.currentLevelData = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    this.remainingShots = this.currentLevelData.maxShots;
    this.score = 0;
    this.canShoot = true;
    this.activeBubble = null;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b1329');

    this.gridManager = new GridManager(this);
    this.matchSystem = new MatchSystem(this.gridManager);

    this.populateFromLevelData();

    this.shooter = new Shooter(this, width / 2, height - 100, this.colors);

    // Cargar la primera burbuja evaluando solo los colores expuestos
    this.shooter.spawnBubble(
      this.gridManager.getActiveBubbles(),
      this.remainingShots,
      this.gridManager.getExposedBubbleColors()
    );

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
  }

  private populateFromLevelData() {
    const gridData = this.currentLevelData.initialGrid;
    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        const colorIndex = gridData[r][c];

        if (colorIndex !== -1 && COLOR_MAP[colorIndex] !== undefined) {
          const pos = this.gridManager.getBubblePosition(r, c);
          const bubble = new Bubble(
            this,
            pos.x,
            pos.y,
            this.gridManager.bubbleRadius,
            COLOR_MAP[colorIndex]
          );

          bubble.setGridPosition(r, c);
          const body = bubble.body as Phaser.Physics.Arcade.Body;
          if (body) body.setImmovable(true);

          this.gridManager.grid[r][c] = bubble;
        }
      }
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.canShoot) return;
    this.isAiming = true;
    this.shooter.drawAimLine(pointer.x, pointer.y);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isAiming || !this.canShoot) return;
    this.shooter.drawAimLine(pointer.x, pointer.y);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.isAiming || !this.canShoot) return;
    this.isAiming = false;

    const shotBubble = this.shooter.shoot(pointer.x, pointer.y);
    if (shotBubble) {
      this.activeBubble = shotBubble;
      this.canShoot = false;
    }
  }

  override update() {
    if (!this.activeBubble) return;

    if (this.activeBubble.y <= this.gridManager.startY + 5) {
      this.processBubblePlacement();
      return;
    }

    const collisionThreshold = this.gridManager.bubbleRadius * 2 - 4;

    for (let r = 0; r < this.gridManager.rows; r++) {
      const maxCols = r % 2 === 1 ? this.gridManager.cols - 1 : this.gridManager.cols;
      for (let c = 0; c < maxCols; c++) {
        const gridBubble = this.gridManager.grid[r][c];
        if (gridBubble) {
          const dist = Phaser.Math.Distance.Between(
            this.activeBubble.x,
            this.activeBubble.y,
            gridBubble.x,
            gridBubble.y
          );

          if (dist <= collisionThreshold) {
            this.processBubblePlacement(gridBubble);
            return;
          }
        }
      }
    }
  }

  private processBubblePlacement(hitBubble?: Bubble) {
    if (!this.activeBubble) return;

    const bubbleToSnap = this.activeBubble;
    this.activeBubble = null;

    const body = bubbleToSnap.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }

    const { row, col } = this.gridManager.snapToGrid(bubbleToSnap, hitBubble);
    const matches = this.matchSystem.checkMatches(row, col);

    if (matches.length >= 3) {
      this.score += matches.length * 100;

      matches.forEach((b) => {
        this.gridManager.grid[b.gridRow][b.gridCol] = null;
        b.destroy();
      });

      const orphans = this.matchSystem.findFloatingOrphans();
      this.score += orphans.length * 150;

      orphans.forEach((b) => {
        this.gridManager.grid[b.gridRow][b.gridCol] = null;

        const oBody = b.body as Phaser.Physics.Arcade.Body;
        if (oBody) {
          oBody.setImmovable(false);
          oBody.setVelocityY(400);
          oBody.setCollideWorldBounds(false);
        }

        this.time.delayedCall(600, () => b.destroy());
      });
    }

    this.checkGameStatus();
  }

  private checkGameStatus() {
    this.remainingShots--;

    this.game.events.emit('UPDATE_HUD', {
      shots: this.remainingShots,
      score: this.score,
    });

    const isGridEmpty = this.gridManager.grid.every((row) =>
      row.every((cell) => cell === null)
    );

    if (isGridEmpty) {
      this.game.events.emit('LEVEL_WIN', {
        levelId: this.currentLevelData.id,
        score: this.score,
        shotsLeft: this.remainingShots,
      });
      return;
    }

    if (this.remainingShots <= 0) {
      this.game.events.emit('LEVEL_LOSE', {
        levelId: this.currentLevelData.id,
      });
      return;
    }

    this.time.delayedCall(150, () => {
      this.shooter.spawnBubble(
        this.gridManager.getActiveBubbles(),
        this.remainingShots,
        this.gridManager.getExposedBubbleColors()
      );
      this.canShoot = true;
    });
  }
}