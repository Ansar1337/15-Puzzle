"use strict"

// referenced screen_container into ScreenManager  // +
// Передавать в контейнеры                         // +
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

// 1. GameBoard freeze while isGamePaused: true            // +
// 1.1  not rendering tiles while isGamePaused: true       // +
// 1. 2 Сбрасывать таймер при нажатии на кнопку Сброс      // +

// 2. Move count                                           // -
// 2.1 Считать ходы при каждом нажатии на тайл              // -
// 2.2 Создать счетчик ходов в PuzzleGame который будет инкрементироваться в случае валидного хода из геймборд. // -


// 2.1 Общий метод для обработки стейтов для избежании комбиноторики.  // -


class PuzzleGame {
    state = {
        isGameStarted: false,
        isGamePaused: false,
    };

    gameBoard;
    screenManager;
    timer;
    startScreen;
    leaderBoard;
    moves;


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
                this.state.isGamePaused = false;
                this.timer.startTimer();
                startRestartButton.textContent = "Pause";
            } else if (!this.state.isGamePaused) {
                this.state.isGamePaused = true;
                this.state.isGameStarted = false;
                this.timer.pauseTimer();
                startRestartButton.textContent = "Start";
            } else {
                startRestartButton.textContent = "Start";
                this.restartGame();
            }
        });

        const resetButton = document.getElementById("reset_btn");
        resetButton.addEventListener("click", () => {
            document.getElementById("moves").textContent = "0";
            this.moves = 0;
            this.state.isGameStarted = false;
            this.state.isGamePaused = false;
            this.showStartScreen();
            this.timer.stopTimer();
            this.timer.renderTimer();
            const button = document.getElementById("start_restart_btn");
            button.textContent = "Start";
        });

        const leaderboardButton = document.getElementById("leaderboard-btn");
        leaderboardButton.addEventListener("click", () => {
            const button = document.getElementById("start_restart_btn");
            button.textContent = "Start";
            this.state.isGamePaused = true;
            this.state.isGameStarted = false;
            this.timer.pauseTimer();
            this.showLeaderboard();
        });
    }

    updateTime() {
        const now = new Date();
    }

    startGame() {
        this.state.isGameStarted = true;
        this.screenManager.switchTo(this.gameBoard.getElement());
        // Initialize the game board and display it
        if (this.state.isGamePaused) {
            return;
        }
        this.gameBoard.createTilesGameBoard();
        this.gameBoard.renderTiles();
        this.moves = 0;
    }

    movesCount() {
        let movesCount = document.getElementById("moves");
        movesCount.textContent = `${this.moves += 1}`;
    }

    restartGame() {
        this.state.isGameStarted = false;
        // this.state.isGamePaused = false;

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


        if (isValidMove && !this.gameObject.state.isGamePaused) {
            // Swap tiles
            [this.cells[emptyTileIndex], this.cells[clickedTileIndex]] = [this.cells[clickedTileIndex], this.cells[emptyTileIndex]];
            this.renderTiles();
            this.gameObject.movesCount();     // M1
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