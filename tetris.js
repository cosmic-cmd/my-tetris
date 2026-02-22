class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.scale(20, 20);

        this.nextCanvas = document.getElementById('next');
        this.nextContext = this.nextCanvas.getContext('2d');
        this.nextContext.scale(20, 20);

        this.arena = this.createMatrix(12, 20);
        this.player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };
        this.nextPiece = null;

        // Reverted to your preferred Neon Colors
        this.colors = [
            null,
            '#FF0D72', // Neon Pink
            '#0DC2FF', // Electric Blue
            '#0DFF72', // Neon Green
            '#F538FF', // Deep Purple
            '#FF8E0D', // Neon Orange
            '#FFE138', // Bright Yellow
            '#3877FF'  // Royal Blue
        ];

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.tracks = [
            'https://cdn.pixabay.com/audio/2024/01/12/audio_eb99a44c6a.mp3',
            'https://cdn.pixabay.com/audio/2024/01/15/audio_1890cd65f6.mp3'
        ];
        this.currentTrack = 0;
        this.audio = new Audio(this.tracks[this.currentTrack]);
        this.audio.loop = true;
        this.paused = true; // Start paused for cleaner UI
        this.highScore = localStorage.getItem('tetrisHighScore') || 0;
        
        this.playerReset();
        this.updateScore();
        this.draw(); // Initial draw
    }

    createPiece(type) {
        if (type === 'T') return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
        if (type === 'O') return [[2, 2], [2, 2]];
        if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
        if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
        if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
        if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
        if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }

    createMatrix(w, h) {
        return Array.from({ length: h }, () => new Array(w).fill(0));
    }

    collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
            }
        }
        return false;
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
            });
        });
    }

    rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    playerDrop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.playerReset();
            this.arenaSweep();
            this.updateScore();
        }
        this.dropCounter = 0;
    }

    playerHardDrop() {
        while (!this.collide(this.arena, this.player)) this.player.pos.y++;
        this.player.pos.y--;
        this.merge(this.arena, this.player);
        this.playerReset();
        this.arenaSweep();
        this.updateScore();
        this.dropCounter = 0;
    }

    playerMove(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) this.player.pos.x -= dir;
    }

    playerReset() {
        const pieces = 'ILJOTSZ';
        if (this.nextPiece === null) this.nextPiece = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.player.matrix = this.nextPiece;
        this.nextPiece = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        this.player.pos.y = 0;
        this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
        if (this.collide(this.arena, this.player)) {
            this.arena.forEach(row => row.fill(0));
            this.player.score = 0;
            this.updateScore();
        }
        this.drawNext();
    }

    playerRotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix, dir);
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.rotate(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
    }

    arenaSweep() {
        let rowCount = 1;
        outer: for (let y = this.arena.length - 1; y > 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) continue outer;
            }
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;
            this.player.score += rowCount * 10;
            rowCount *= 2;
        }
    }

    updateScore() {
        document.getElementById('score').innerText = this.player.score;
        if (this.player.score > this.highScore) {
            this.highScore = this.player.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
        }
        document.getElementById('highScore').innerText = this.highScore;
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.arena, {x: 0, y: 0});
        this.drawGhost();
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawNext() {
        this.nextContext.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.drawMatrix(this.nextPiece, {x: 1, y: 1}, this.nextContext);
    }

    drawMatrix(matrix, offset, context = this.context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // Main Neon Fill
                    context.fillStyle = this.colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                    
                    // 3D Glass Effect (Inner Highlight)
                    context.fillStyle = 'rgba(255,255,255,0.4)';
                    context.fillRect(x + offset.x, y + offset.y, 0.9, 0.1); // Top light
                    context.fillRect(x + offset.x, y + offset.y, 0.1, 0.9); // Left light
                    
                    // Shadow Edge
                    context.fillStyle = 'rgba(0,0,0,0.3)';
                    context.fillRect(x + offset.x + 0.9, y + offset.y, 0.1, 1); // Right dark
                    context.fillRect(x + offset.x, y + offset.y + 0.9, 1, 0.1); // Bottom dark
                }
            });
        });
    }

    drawGhost() {
        const ghost = { pos: { x: this.player.pos.x, y: this.player.pos.y }, matrix: this.player.matrix };
        while (!this.collide(this.arena, ghost)) ghost.pos.y++;
        ghost.pos.y--;
        this.context.globalAlpha = 0.15;
        this.drawMatrix(ghost.matrix, ghost.pos);
        this.context.globalAlpha = 1.0;
    }

    update(time = 0) {
        if (this.paused) return;
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) this.playerDrop();
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    togglePause() {
        this.paused = !this.paused;
        document.getElementById('pause-btn').innerText = this.paused ? 'RESUME GAME' : 'PAUSE GAME';
        if (!this.paused) {
            if (!this.audio.muted) this.audio.play();
            this.update();
        } else {
            this.audio.pause();
        }
    }
}

// Global Init
const canvas = document.getElementById('tetris');
const game = new Tetris(canvas);

document.getElementById('mute-btn').addEventListener('click', () => {
    game.audio.muted = !game.audio.muted;
    document.getElementById('mute-btn').innerText = game.audio.muted ? '🔊 UNMUTE' : '🔇 MUTE';
});
document.getElementById('next-track-btn').addEventListener('click', () => {
    game.audio.pause();
    game.currentTrack = (game.currentTrack + 1) % game.tracks.length;
    game.audio.src = game.tracks[game.currentTrack];
    if (!game.audio.muted) game.audio.play();
});
document.getElementById('pause-btn').addEventListener('click', () => game.togglePause());

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) game.playerMove(-1);
    else if (event.keyCode === 39) game.playerMove(1);
    else if (event.keyCode === 40) game.playerDrop();
    else if (event.keyCode === 81) game.playerRotate(-1);
    else if (event.keyCode === 87) game.playerRotate(1);
    else if (event.keyCode === 80) game.togglePause();
    else if (event.keyCode === 32) { event.preventDefault(); game.playerHardDrop(); }
});