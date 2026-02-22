class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.scale(20, 20);

        this.arena = this.createMatrix(12, 20);
        this.player = {
            pos: {x: 0, y: 0},
            matrix: null,
            score: 0,
        };

        this.colors = [
            null, '#FF0D72', '#0DC2FF', '#0DFF72', 
            '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
        ];

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.resetPlayer();
        this.update();
    }

    createMatrix(w, h) {
        return Array.from({ length: h }, () => new Array(w).fill(0));
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.arena, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // ... (logic for merge, collide, and rotate goes here)
    // For your GitHub repo, I recommend moving these into 
    // separate methods to keep the code readable!
}

// Initialize when the script loads
const canvas = document.getElementById('tetris');
const game = new Tetris(canvas);