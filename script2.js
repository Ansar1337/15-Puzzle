"use strict"

// reference screen_container into ScreenManager
class ScreenManager {
    currentScreen = null;
    container;

    constructor(container) {
        this.container = container;
    }

    setInitialScreen(initialScreen) {
        this.container.append(initialScreen);
        this.currentScreen = initialScreen;
    }

    switchTo(newScreen) {
        this.currentScreen.replaceWith(newScreen); // replace current screen with new screen
        this.currentScreen = newScreen;
    }
}

// 1. Timer
// 2. Move count
// Передавать в контейнеры
class PuzzleGame {
    state = {
        isGameStarted: false,
    };

    gameBoard;
    screenManager;
    timer;
    startScreen;
    leaderBoard;

    constructor() {
        this.startScreen = new StartScreen(this);
        this.gameBoard = new GameBoard(this);
        this.screenManager = new ScreenManager(document.getElementById("screen_main"));
        this.leaderBoard = new Top15_Screen(this);
        this.timer = new Timer(document.getElementById("time"));
    }

    init() {
        this.screenManager.setInitialScreen(this.startScreen.get());

        // Add event listeners to buttons
        const startRestartButton = document.getElementById("start_restart_btn");
        startRestartButton.addEventListener("click", () => {
            if (!this.state.isGameStarted) {
                this.startGame();
            } else {
                this.restartGame();
            }
        });

        const resetButton = document.getElementById("reset_btn");
        resetButton.addEventListener("click", () => this.showStartScreen());

        const leaderboardButton = document.getElementById("leaderboard-btn");
        leaderboardButton.addEventListener("click", () => this.showLeaderboard());
    }

    updateTime() {
        const now = new Date();
    }

    startGame() {
        this.state.isGameStarted = true;

        // Initialize the game board and display it
        this.gameBoard.createTilesGameBoard();
        this.gameBoard.renderTiles();
        this.screenManager.switchTo(this.gameBoard.getElement());
    }

    restartGame() {
        this.state.isGameStarted = false;

        // Reset the game board
        this.gameBoard.reset();
        this.startGame();
    }

    showStartScreen() {
        this.state.isGameStarted = false;

        // Return to the Start Screen
        const startScreen = new StartScreen();
        this.screenManager.switchTo(startScreen.get());
    }

    showLeaderboard() {
        const top15Screen = new Top15_Screen();
        this.screenManager.switchTo(top15Screen.get());
    }
}


class GameBoard {
    gameObject;
    container;
    cells = [];
    tableSize;

    constructor(gameObject) {
        this.gameObject = gameObject;
        this.container = this.createScreen();
        this.tableSize = 15; // 15 tiles
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("game_board");
        return container;
    }

    getElement() {
        return this.container;
    }

    createTilesGameBoard() {
        this.cells = []; // Reset cells
        this.container.innerHTML = ""; // Clear previous tiles

        // Create tiles and shuffle
        for (let i = 0; i < this.tableSize; i++) {
            this.cells.push(this.createTile(i + 1));
        }

        for (let i = this.cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]];
        }

        // Add the empty tile
        this.cells.push(this.createTile(this.tableSize + 1));
    }

    createTile(number) {
        const tile = document.createElement("div");
        tile.classList.add("puzzle_item");
        tile.textContent = number.toString();
        tile.dataset.number = number;

        // Handle tile click
        tile.addEventListener("click", () => {
            if (number !== this.cells.length + 1) {
                this.moveTile(tile);
            }
        });

        return tile;
    }

    renderTiles() {
        this.container.innerHTML = ""; // Clear previous tiles
        this.cells.forEach((cell) => this.container.appendChild(cell));
    }

    victoryDetect() {
        for (let i = 0; i <= this.cells.length - 1; i++) {
            if (this.cells[i].textContent !== (i + 1).toString()) {
                return false;
            }
        }
        return true;
    }

    moveTile(clickedTile) {
        const rowSize = Math.sqrt(this.cells.length);
        const emptyTileIndex = this.cells.findIndex((tile) => {
            return tile.dataset.number === (this.cells.length).toString();
        });
        const clickedTileIndex = this.cells.indexOf(clickedTile);

        const validMoves = [
            emptyTileIndex - 1, // Left
            emptyTileIndex + 1, // Right
            emptyTileIndex - Math.sqrt(this.cells.length), // Up
            emptyTileIndex + Math.sqrt(this.cells.length)  // Down
        ];
        const isSameRow = (index1, index2) =>
            Math.floor(index1 / rowSize) === Math.floor(index2 / rowSize);

        const isValidMove = validMoves.includes(clickedTileIndex) &&
            (isSameRow(emptyTileIndex, clickedTileIndex) ||
                (emptyTileIndex - clickedTileIndex === rowSize || // up
                    clickedTileIndex - emptyTileIndex === rowSize)); // down


        if (isValidMove) {
            // Swap tiles
            [this.cells[emptyTileIndex], this.cells[clickedTileIndex]] = [this.cells[clickedTileIndex], this.cells[emptyTileIndex]];
            this.renderTiles();
        }

        if (this.victoryDetect()) {
            setTimeout(() => {
                alert("Congrats!!!");
                // this.state.isGameOver = true;
            }, 0);
        }
    }

    reset() {
        this.cells = [];
        this.container.innerHTML = "";
    }
}

class StartScreen {
    gameObject;
    element;

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("start_screen");

        const title = document.createElement("h1");
        title.textContent = "Fifteen Game";

        container.append(title);

        return container;
    }

    get() {
        return this.element;
    }
}

class Top15_Screen {
    gameObject;
    element;

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("top15_screen");

        const title = document.createElement("h1");
        title.textContent = "Top 15 Players";

        const list = document.createElement("ol");
        for (let i = 1; i <= 15; i++) {
            const listItem = document.createElement("li");
            listItem.textContent = `Player ${i} - ${Math.floor(Math.random() * 1000)} points`;
            list.append(listItem);
        }

        container.append(title);
        container.append(list);

        return container;
    }

    get() {
        return this.element;
    }
}

class Timer {
    startTime;
    passedTime = 0;
    timeInterval;
    paused = false;
    running = false;
    object;

    constructor(object) {
        this.object = object;
    }

    renderTimer() {
        const minutes = (this.passedTime.getUTCMinutes()).toString().padStart(2, '0');
        const seconds = (this.passedTime.getUTCSeconds()).toString().padStart(2, '0');
        this.object.textContent = `${minutes}:${seconds}`;
    }

    startTimer() {
        if (this.running) {
            console.log("Таймер уже работает");
            return;
        }
        this.running = true;
        this.paused = false;

        this.timeInterval = setInterval(() => {
            const currentTime = Date.now();
            this.passedTime = new Date(currentTime - this.startTime);
            this.renderTimer();
        }, 1000);
        this.startTime = Date.now() - this.passedTime;
    }

    pauseTimer() {
        this.paused = true;
        this.running = false;
        clearInterval(this.timeInterval);
    }

    stopTimer() {
        this.paused = false;
        this.running = false;
        this.resetTimer();
        clearInterval(this.timeInterval);
    }

    resetTimer(resetView = false) {
        this.startTime = Date.now();
        this.passedTime = new Date(0);
        if (resetView) {
            this.renderTimer();
        }
    }
}

// Initialize the PuzzleGame
(new PuzzleGame()).init();

// HW
// 1. Timer on start btn game
// 2. Reset timer functionality
// 3. Click on Start -> Pause functionality
// 4. Switching to other screens should pause the timer