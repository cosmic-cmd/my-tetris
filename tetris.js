class Tetris {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.scale(20, 20);

        // Setup Next Piece Canvas
        this.nextCanvas = document.getElementById('next');
        this.nextContext = this.nextCanvas.getContext('2d');
        this.nextContext.scale(20, 20);

        this.arena = this.createMatrix(12, 20);
        this.player = {
            pos: {x: 0, y: 0},
            matrix: null,
            score: 0,
        };

        this.nextPiece = null;
        this.colors = [
            null, '#FF0D72', '#0DC2FF', '#0DFF72', 
            '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
        ];

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.playerReset(); // Corrected function name
        this.update();
        this.tracks = [
        'https://cdn.pixabay.com/audio/2024/01/12/audio_eb99a44c6a.mp3',
        'https://cdn.pixabay.com/audio/2024/01/15/audio_1890cd65f6.mp3',
        'https://cdn.pixabay.com/audio/2024/01/09/audio_e3e11a1439.mp3',
        'https://cdn.pixabay.com/audio/2025/04/10/audio_9ce76240d5.mp3'
        ];
        this.currentTrack = 0;
        this.audio = new Audio(this.tracks[this.currentTrack]);
        this.audio.loop = true;
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
                if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
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
    // Keep dropping until it hits something
    while (!this.collide(this.arena, this.player)) {
        this.player.pos.y++;
    }
    // Back up one space because the loop stopped AFTER hitting something
    this.player.pos.y--;
    
    // Finalize the position
    this.merge(this.arena, this.player);
    this.playerReset();
    this.arenaSweep();
    this.updateScore();
    this.dropCounter = 0;
    }   

    playerMove(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= dir;
        }
    }

    playerReset() {
        const pieces = 'ILJOTSZ';
        if (this.nextPiece === null) {
            this.nextPiece = this.createPiece(pieces[pieces.length * Math.random() | 0]);
        }
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
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.arena, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawNext() {
        this.nextContext.fillStyle = '#000';
        this.nextContext.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.drawMatrix(this.nextPiece, {x: 1, y: 1}, this.nextContext);
    }

    drawMatrix(matrix, offset, context = this.context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = this.colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.playerDrop();
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    toggleMute() {
    this.audio.muted = !this.audio.muted;
    document.getElementById('mute-btn').innerText = this.audio.muted ? '🔊 Unmute' : '🔇 Mute';
    }

    nextTrack() {
    this.audio.pause();
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.audio.src = this.tracks[this.currentTrack];
    if (!this.audio.muted) this.audio.play();
    }
}

// Initialization
const canvas = document.getElementById('tetris');
const game = new Tetris(canvas);

// Music Manager
document.getElementById('mute-btn').addEventListener('click', () => {
    // Browsers block auto-play; music starts on first user interaction
    if (game.audio.paused) game.audio.play();
    game.toggleMute();
});

document.getElementById('next-track-btn').addEventListener('click', () => {
    game.nextTrack();
});

// Input Handling
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) game.playerMove(-1);      // Left
    else if (event.keyCode === 39) game.playerMove(1);  // Right
    else if (event.keyCode === 40) game.playerDrop();   // Down
    else if (event.keyCode === 81) game.playerRotate(-1); // Q
    else if (event.keyCode === 87) game.playerRotate(1);  // W
    else if (event.keyCode === 32) {                    // Spacebar
        event.preventDefault(); // Prevents the page from scrolling down
        game.playerHardDrop();
    }
});