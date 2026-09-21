import Phaser from 'phaser';

export class Bubble extends Phaser.GameObjects.Arc {
  public gridRow: number = -1;
  public gridCol: number = -1;
  public colorValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number) {
    super(scene, x, y, radius, 0, 360, false, color);
    this.colorValue = color;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(radius);
  }

  public setGridPosition(row: number, col: number) {
    this.gridRow = row;
    this.gridCol = col;
  }
}