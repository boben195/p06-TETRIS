class Tetris {
    constructor(rows, cols, blockSize) {
        this.rows = rows;
        this.cols = cols;
        this.blockSize = blockSize;

        this.shapes = [
            { shape: [[1, 1, 1, 1]], class: "piece-i" },
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ], class: "piece-o"
            },
            {
                shape: [
                    [1, 1, 1],
                    [0, 1, 0]
                ], class: "piece-t"
            },
            {
                shape: [
                    [1, 1, 1],
                    [1, 0, 0]
                ], class: "piece-j"
            },
            {
                shape: [
                    [1, 1, 1],
                    [0, 0, 1]
                ], class: "piece-l"
            },
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ], class: "piece-s"
            },
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ], class: "piece-z"
            },
        ];
        this.gameBoard = document.getElementById("game-board");
        this.nextPieceCanvas = document.getElementById("next-piece");
        this.ctx = this.gameBoard.getContext("2d");
        this.nextCtx = this.nextPieceCanvas.getContext("2d");
        this.scoreElement = document.getElementById("score");
        this.levelElement = document.getElementById("level");
        this.linesElement = document.getElementById("lines");
        this.startButton = document.getElementById("start-btn");

        this.gameBoard.width = this.cols * this.blockSize;
        this.gameBoard.height = this.rows * this.blockSize;
        this.nextPieceCanvas.width = 4 * this.blockSize;
        this.nextPieceCanvas.height = 4 * this.blockSize;

        this.grid = Array.from({
            length: this.rows
        }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.currenPiece = null;
        this.nextPiece = null;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
    }

    bindEvents() {
        document.addEventListener("keydown", this.handleKeyPress.bind(this))
        this.startButton.addEventListener("click", this.startGame.bind(this))
    }

    handleKeyPress(event) {
        if (this.gameOver) return;

        switch (event.key) {
            case "ArrowUp":
                this.rotate();
                break;
            case "ArrowDown":
                this.move(0, 1);
                break;
            case "ArrowLeft":
                this.move(-1, 0);
                break;
            case "ArrowRight":
                this.move(1, 0);
                break;
                
        }

    }

    startGame() {
        this.reset();
        this.spawnPiece();
        this.update();
    }

    update(time = 0) { 
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.move(0, 1);
            this.dropCounter = 0;
        }
        this.draw();

        if (!this.gameOver) {
            requestAnimationFrame(this.update.bind(this));
        } else {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(0, 0, this.gameBoard.width, this.gameBoard.height);
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "20px 'Press Start 2P'";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER", this.gameBoard.width / 2, this.gameBoard.height / 2);
        }
    }
    
    move(dx, dy) {
        this.currenPiece.x += dx;
        this.currenPiece.y += dy;
        if (this.collision()) {
            this.currenPiece.x -= dx;
            this.currenPiece.y -= dy;
            if (dy > 0) {
                this.freeze();
                this.clearLines();
                this.spawnPiece();
            };
        };
    }

    // rotate() {
    //     const originalShape = this.currenPiece.shape;
    //     this.currenPiece.shape = this.currenPiece.shape[0].map((_, i) => {
    //         this.currenPiece.shape.map(row => row[i]).reverse()
    //     });
    //     if (this.collision()) {
    //         this.currenPiece.shape = originalShape;
    //     }
    // }


    rotateMatrix(matrix) {
    return matrix[0].map((_, colIndex) =>
        matrix.map(row => row[colIndex]).reverse()
    );
}
    rotate() {
  const rotated = this.rotateMatrix(this.currenPiece.shape);
  const originalX = this.currenPiece.x;

 
  const offsets = [0, -1, 1, -2, 2];

  for (let offset of offsets) {
    this.currenPiece.shape = rotated;
    this.currenPiece.x = originalX + offset;

    if (!this.collision()) {
      return; 
    }
  }

  
  this.currenPiece.shape = this.rotateMatrix(this.rotateMatrix(this.rotateMatrix(rotated))); // 3x rotate back
  this.currenPiece.x = originalX;
}

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            };
        };
        if (linesCleared > 0) {
            this.score += [40, 100, 300, 1200][linesCleared - 1] * this.level;
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = 1000 - (this.level - 1) * 50;
            this.updateScore();
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }

    freeze() {
        this.currenPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    this.grid[this.currenPiece.y + dy][this.currenPiece.x + dx] = this.currenPiece.class;
                }
            });
        });
    }
    
    collision() {
        return this.currenPiece.shape.some((row, dy) => 
            row.some((value, dx) => {
                const x = this.currenPiece.x + dx;
                const y = this.currenPiece.y + dy;
                return (
                    value && (x < 0 || x >= this.cols || y >= this.rows || (this.grid[y] && this.grid[y][x]))
                )
            })
        );
    }

    draw() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.ctx.fillRect(0, 0, this.gameBoard.width, this.gameBoard.height);

        this.drawGrid();
        this.drawPiece();
    }



    drawGrid() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(this.ctx, x, y, value)

                }
            });
        });
    }

    

    drawPiece() {
        console.log("drawing piece", this.currenPiece);
        this.currenPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(this.ctx, this.currenPiece.x + x, this.currenPiece.y + y, this.currenPiece.class);
                }
            });
        });

    }

    drawNextPiece() {
        this.nextCtx.fillStyle = "rgba(0, 0, 0, 0.8)"
        this.nextCtx.fillRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height)
        
        const offsetX = (4 - this.nextPiece.shape[0].length) / 2;
        const offsetY = (4 - this.nextPiece.shape.length) / 2;

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(this.nextCtx, offsetX + x, offsetY + y, this.nextPiece.class)
                }
            })
        })
    }
    drawBlock(ctx, x, y, pieceClass) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(`--${pieceClass}-color`);
        ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3";
        ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(x * this.blockSize, y * this.blockSize);
        ctx.lineTo((x + 1) * this.blockSize, y * this.blockSize);
        ctx.lineTo(x * this.blockSize, (y + 1) * this.blockSize);
        ctx.fill();
    }

    reset() {
        this.grid = Array.from({
            length: this.rows
        }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.updateScore();
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.randomPiece()

        }
        this.currenPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.drawNextPiece();

        if (this.collision()) {
            this.gameOver = true;
        }
    }

    randomPiece() {
        const pieceIndex = Math.floor(Math.random() * this.shapes.length);
        const piece = this.shapes[pieceIndex];
        return {
            shape: piece.shape,
            class: piece.class,
            x: Math.floor(this.cols / 2) - Math.ceil(piece.shape[0].length / 2),
            y: 0
        };
    }

}
// const game = new Tetris(20, 10, 30);
// game.bindEvents();