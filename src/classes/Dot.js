class Dot extends Phaser.GameObjects.Arc {
	
	constructor(scene, x, y, radius, color, row, column) {
		super(scene, x, y, radius, 0, 360, false, color, 1);
		this.targetX = x;
		this.targetY = y;
		this.row = row;
		this.column = column;
		this.color = color;
		this.setInteractive()
		this.on('pointerover', function (pointer) {
			// console.log("hovered");
			if (scene.input.activePointer.isDown) {
				// console.log('Pointer over')
				scene.selectedStack.selectDot(this)
			}
		});
		this.on('pointerdown', function (pointer) {
			// console.log('Pointer down')
			scene.selectedStack.selectDot(this);
		});
		this.scale = 0;
		this.scene.tweens.add({
			targets: this,
			scale: 1,
			duration: 500,
			ease: 'Bounce.out',
			delay: 250 + this.row * 100
		});
		scene.add.existing(this)
	}
	
	popDot()
	{
		this.particles = this.scene.add.particles('dust');
		this.emitter = this.particles.createEmitter();
		this.emitter.setPosition(this.x,this.y);
		this.emitter.setSpeed({min:20, max: 100});
		this.emitter.setBlendMode(Phaser.BlendModes.NORMAL);
		this.emitter.setFrequency(-1, 6);
		this.emitter.setLifespan({ min: 100, max: 300 });
		this.emitter.setScale({min:0.15, max: 0.3})
		this.emitter.setGravity(0,500);
		this.emitter.explode()
		//this.emitter.acceleration);
		this.scene.gameboard[this.row][this.column].dot = null;
		this.destroy();
	}

	fall(newRow, points) {
		this.path = new Phaser.Curves.Path(this.x, this.y)
		let timeline = this.scene.tweens.createTimeline();
		for (let i = this.row; i <= newRow; i++) {
			timeline.add({
				targets: this,
				x: points[this.column][i].x,
				y: points[this.column][i].y,
				ease: 'Bounce.out',
				duration: 100
			});
		}
		timeline.play();
		this.row = newRow;
		this.depth = 1;
	}

	update() {
	}
}