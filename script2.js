"use strict"


class ScreenManager {
    currentScreen = null;

    setInitialScreen(initialScreen) {
        if (this.currentScreen) {
            this.currentScreen.remove(); // Remove the current screen
        }
        document.body.append(initialScreen); // Add the initial screen
        this.currentScreen = initialScreen;
    }

    switchTo(newScreen) {
        if (this.currentScreen) {
            this.currentScreen.remove(); // Remove the current screen
        }
        document.body.append(newScreen); // Add the new screen
        this.currentScreen = newScreen;
    }
}


class PuzzleGame {
    state = {
        isGameStarted: false,
    };

    gameBoard;
    screenManager;

    constructor() {
        this.gameBoard = new GameBoard();
        this.screenManager = new ScreenManager();
    }

    init() {
        // Set up the initial Start Screen
        const startScreen = new StartScreen(() => this.startGame());
        this.screenManager.setInitialScreen(startScreen.get());

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
        const startScreen = new StartScreen(() => this.startGame());
        this.screenManager.switchTo(startScreen.get());
    }
}


class GameBoard {
    container;
    cells = [];
    tableSize;

    constructor() {
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

    reset() {
        this.cells = [];
        this.container.innerHTML = "";
    }
}

class StartScreen {
    constructor(onStartCallback) {
        this.onStartCallback = onStartCallback;
        this.element = this.createScreen();
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("screen_container");

        const title = document.createElement("h1");
        title.textContent = "Fifteen Game";

        container.appendChild(title);

        return container;
    }

    get() {
        return this.element;
    }
}

// Initialize the PuzzleGame
(new PuzzleGame()).init();
