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

    startGame() {
        this.reset();
        this.spawnPiece();
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

    }
    drawBlock(ctx, x, y, pieceClass) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(`--${pieceClass}-color`)
    }

    reset() {
        this.grid = Array.from({
            length: this.rows
        }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.randomPiece()

        }
        this.currenPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
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
const game = new Tetris(20, 10, 30);