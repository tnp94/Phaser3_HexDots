class SelectedStack {
    constructor(scene) {
        this.scene = scene;
        this.currentRow = null;
        this.currentColumn = null;
        this.currentColor = null;
        this.stack = [];
        this.loop = false;
        this.path = null;
        this.lines = [];
        this.graphics = this.scene.add.graphics();
    }

    selectDot(dot) {
        let last = this.stack[this.stack.length - 1];
        let penultimate = this.stack[this.stack.length - 2];
        if (this.stack.length == 0) { // Empty stack
            this.stack.push(dot);
            this.currentColor = dot.color;
            this.currentColumn = dot.column;
            this.currentRow = dot.row;
        }
        else if (this.scene.AreAdjacent(last, dot)) {
            if (this.stack.indexOf(dot) < 0) { // New dot
                if (!this.loop && dot.fillColor == last.fillColor) {
                    // console.log("Pushed onto stack")
                    this.stack.push(dot)
                }
            }
            else if (this.stack.length > 1) {
                if (dot === penultimate) {
                    this.stack.pop();
                    this.loop = false;
                    console.log("Loop is now false");
                }
                else if (this.stack.length > 2) {
                    if ((!this.loop) && dot === this.stack[0]) { // reached the first again
                        this.stack.push(dot);
                        this.loop = true;
                        console.log("Loop is now true");
                    }
                }
            }
            else {

                // console.log("Already on stack")
            }
        }
        // console.log(this.stack)
    }

    scoreStack() {
        // console.log(this.selectedStack.stack)
        if (this.loop) {
            this.stack.pop()
        }
        let score = {};
        score.points = this.stack.length;
        score.loop = this.loop;
        this.loop = false;
        if (this.stack.length > 1) {
            while (this.stack.length > 0) {
                let current = this.stack.pop();
                // console.log(current);
                current.popDot()
            }
        }
        else {
            score.points = 0;
            this.stack = [];
        }
        return score;
        // FillEmptyHexagons(gameScene.gameboard);
    }

    updateLine() {
        this.graphics.clear();
        if (this.stack.length > 0) {
            let lastDot = this.stack[this.stack.length - 1];
            let pointer = this.scene.input.activePointer
            this.graphics.depth = 2;
            this.graphics.lineStyle(5, lastDot.color);
            //if (this.lineToPointer == null) {
            //    this.lineToPointer = this.scene.add.line(
            //        lastDot.x,
            //        lastDot.y,
            //        0,
            //        0,
            //        pointer.x,
            //        pointer.y,
            //        lastDot.color,
            //    );
            //    this.lineToPointer.isFilled = true;
            //}
            //else {
            //    this.lineToPointer.strokeColor = lastDot.color
            //    this.lineToPointer.x = lastDot.x;
            //    this.lineToPointer.y = lastDot.y;
            //    this.lineToPointer.x1 = pointer.x;
            //    this.lineToPointer.y1 = pointer.y;
            //}
            this.path = new Phaser.Curves.Path(this.stack[0].x, this.stack[0].y);
            for (let i = 1; i < this.stack.length; i++) {
                this.path.lineTo(this.stack[i].x, this.stack[i].y);
            }
            if (!this.loop) {
                this.path.lineTo(this.scene.input.activePointer.x, this.scene.input.activePointer.y);
            }
            this.path.draw(this.graphics, 128);

        }
    }
}