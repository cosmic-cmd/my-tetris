# 🕹️ OpenShift Tetris v2

A lightweight, full-stack Tetris clone featuring a persistent SQLite leaderboard, optimized for **OpenShift Container Platform**.

## 🚀 Added Features
* **Persistent Leaderboard:** Integrated Node.js backend with SQLite3 to track the Top 5 High Scores.
* **Visual Enhancements:** Added particle effects on "Hard Drop" and updated combo widgets for real-time feedback.
* **Advanced Logic:** Refined score calculation and added warning notifications for critical game states.
* **Infrastructure Ready:** Automated Docker builds and persistent storage integration for enterprise-grade hosting.

## 🏗️ Technical Architecture
* **Frontend:** Vanilla JavaScript, HTML5 Canvas, and CSS3 (Dark Mode).
* **Backend:** Node.js 18 (Alpine) using Express to handle scoring APIs.
* **Database:** SQLite3, with the database file (`leaderboard.db`) stored on a **1GB Persistent Volume**
* **Containerization:** Optimized `Dockerfile` with OpenShift-standard permissions (`chgrp/chmod`) to ensure the database directory is writable.

## 📂 Project Structure
* `server.js`: The Express server and SQLite API endpoint logic.
* `public/`: Contains the core game assets (`index.html`, `style.css`, `tetris.js`).
* `Dockerfile`: Multi-stage build instructions for OpenShift deployment.
* `package.json`: Manages dependencies including `express` and `sqlite3`.
* `.dockerignore`: Ensures `node_modules` and local logs are excluded from the image build.

## 🎮 How to Play
1. Access the game via the OpenShift Route URL.
2. Use **Arrow Keys** to move and **Q/W** to rotate.
3. Use **Space** to hard drop.
4. Use **P** to Pause the game.
5. Submit your name at the start of the game to join the persistent Leaderboard.

## 🛠️ Deployment Summary
* The database is mounted at `/data/tetris`.
---

### ☕ About the Project
Maintained by **Cosmic-CMD**. Designed to provide a high-performance, low-latency gaming experience directly from the private cloud.