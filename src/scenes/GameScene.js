class GameScene extends Phaser.Scene{

    constructor(game, boardSize, colorCount, hexWidth, hexHeight, showHexes) {
        super(game);
        this.colorList = [0x0, 0xf2f200, 0xdd2222, 0x33aa33, 0x3333aa, 0xffaaaa, 0x33ffff]
        this.colorCount = Math.min(colorCount, this.colorList.length);
        this.boardsize = Math.min(boardSize, 11);
        this.hexWidth = hexWidth;
        this.hexHeight = hexHeight;
        this.showHexes = showHexes;
        this.score = 0;
    }
    
    RandomColor(colorCount) {
        let colorIndex
        do
        {
            colorIndex = (Math.floor(Math.random() * colorCount))

        } while (colorIndex >= this.colorList.length)
        let color = this.colorList[colorIndex % (this.colorList.length)]
        return color
    }

    AreAdjacent(dot1, dot2) {
        if (dot1.row == dot2.row) {
            if (Math.abs(dot1.column - dot2.column) == 1) {
                return true;
            }
        }
        else if (Math.abs(dot1.row - dot2.row) == 1) {
            // One row above or below
            // If dot1.row is even, check if dot2.column is the same or -1
            // If dot1.row is odd, check if dot2.column is the same or +1
            if (dot1.column == dot2.column || dot2.column == (dot1.column - 1) + 2*((dot1.row) % 2)) {
                return true;
            }
        }
        return false;
    }

    preload()
    {
        this.load.image('dust', 'assets/dust.png');
        this.load.image('hexagon', 'assets/Hexagon.png');
    }

    create()
    {
        this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: '32px', fill: '#000' });
        let thisScene = this;
        this.selectedStack = new SelectedStack(this);
        this.clearColor = function (gameboard, color) {
            let score = 0;
            for (let i in gameboard) {
                let row = gameboard[i];
                for (let j in row) {
                    let dot = row[j].dot;
                    if (dot && dot.color === color) {
                        dot.popDot();
                        score += 1;
                    }
                }
            }
            return score;
        }
        this.boardoffsetX = (this.sys.game.config.width / 2) - ((this.hexWidth * this.boardsize ) / 2);
        this.boardoffsetY = (this.sys.game.config.height / 2) - (this.hexHeight*2/3 * (this.boardsize-1)/2);
        this.input.on('pointerup', function (pointer) {
            // function to clear selected and give points
            let score = thisScene.selectedStack.scoreStack();
            thisScene.score += score.points**2;
            let loopScore = 0
            if (score.loop) {
                loopScore = thisScene.clearColor(thisScene.gameboard, thisScene.selectedStack.currentColor);
                thisScene.score += loopScore;
            }
            thisScene.scoreText.setText(`Score: ${thisScene.score}`);
            thisScene.fallDots();
            thisScene.refillDots();
            console.log(score.points**2, loopScore)
        });
        this.gameboard = [];
        for (let i = 0; i < this.boardsize; i++)
        {
            let gamerow = [];
            for (let j = 0; j < this.boardsize; j++)
            {
                let color = this.RandomColor(this.colorCount)
                let dot = new Dot(this, (j*this.hexWidth) + (i % 2 * (this.hexWidth / 2)) + this.boardoffsetX, (i * (2 * this.hexHeight / 3)) + this.boardoffsetY, 15, color, i, j).setInteractive();
                gamerow[j] = {};
                gamerow[j].dot = dot;
                gamerow[j].positionX = (j * this.hexWidth) + (i % 2 * (this.hexWidth / 2)) + this.boardoffsetX;
                gamerow[j].positionY = (i * (2 * this.hexHeight / 3)) + this.boardoffsetY;
                if (this.showHexes)
                {
                    gamerow[j].hex = this.add.image(gamerow[j].positionX, gamerow[j].positionY, 'hexagon');
                    gamerow[j].hex.alpha = 0.03;
                }
            }

            this.gameboard[i] = gamerow;
        }
        this.columnPoints = [];

        let graphics = this.add.graphics();
        graphics.depth = -1;
        graphics.lineStyle(1, 0x333333, 1);
        for (let c = 0; c < this.boardsize; c++) {
            let path = new Phaser.Curves.Path(this.gameboard[0][c].positionX, this.gameboard[0][c].positionY);
            let columnPoints = [];
            for (let r = 0; r < this.boardsize; r++) {
                let columnPoint = {};
                columnPoint.x = this.gameboard[r][c].positionX;
                columnPoint.y = this.gameboard[r][c].positionY;
                path.lineTo(columnPoint.x, columnPoint.y);
                columnPoints[r] = columnPoint;
            }
            this.columnPoints[c] = columnPoints;

            path.draw(graphics, 128);
        }
    }

    update() {
        this.selectedStack.updateLine();
    
    }
    
    fallDots() {
        let gameboard = this.gameboard;
        for (let i = this.boardsize - 1; i >= 0; i--) {
            let row = gameboard[i];
            for (let j = this.boardsize - 1; j >= 0; j--) {
                let dot = row[j].dot;
                // Start at row above me
                // Check if dot is in the same column
                // If it is, 'steal'
                let victimRow = i - 1;
                while (dot == null && victimRow >= 0)
                {
                    let victimDot = gameboard[victimRow][j].dot;
                    gameboard[victimRow][j].dot = null;
                    if (victimDot != null) {
                        dot = victimDot;
                        let y = (i * (2 * this.hexHeight / 3)) + this.boardoffsetY;
                        let x = (j * this.hexWidth) + (i % 2 * (this.hexWidth / 2)) + this.boardoffsetX;
                        dot.fall(i, this.columnPoints)
                        row[j].dot = dot;
                    }
                    victimRow--;
                }
            }

        }
    }

    refillDots() {
        let gameboard = this.gameboard;
        for (let i = this.boardsize - 1; i >= 0; i--) {
            let row = gameboard[i];
            for (let j = this.boardsize - 1; j >= 0; j--) {
                let dot = row[j].dot;
                if (dot == null) {
                    let color = this.RandomColor(this.colorCount)
                    let dot = new Dot(this, (j * this.hexWidth) + (i % 2 * (this.hexWidth / 2)) + this.boardoffsetX, (i * (2 * this.hexHeight / 3)) + this.boardoffsetY, 15, color, i, j).setInteractive();
                    row[j].dot = dot;
                }
            }
        }
    }

    select(x, y) {
        this.selectedStack.stack.push(this.gameboard[x][y].dot);
    }
    
    pop() {
        this.selectedStack.stack.pop();
    }

    score() {
        this.selectedStack.scoreStack();
        this.refresh();
    }

    refresh() {
        this.fallDots();
        this.refillDots();
    }
}