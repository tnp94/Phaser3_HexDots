class Hexagon extends Phaser.GameObjects.Container {
	
	constructor(scene, x, y, hexKey) {
		super(scene);
		this.x = x;
		this.y = y;
		this.hexagon = scene.add.image(0, 0, hexKey)
		this.add(this.hexagon)
	}
}