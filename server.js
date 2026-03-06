const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Path to your Team's 100GB mount
const DB_DIR = '/data/tetris';
const DB_PATH = path.join(DB_DIR, 'leaderboard.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.use(express.json());
app.use(express.static('public')); // This serves your HTML/JS/CSS

app.get('/api/scores', (req, res) => {
    db.all("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;
    db.run("INSERT INTO scores (name, score) VALUES (?, ?)", [name, score], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.listen(PORT, () => console.log(`Mission Active on port ${PORT}`));