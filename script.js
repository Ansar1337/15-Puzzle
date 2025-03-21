"use strict"

import {localization} from "./locals/localization.js";

let localLang = "ru";

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
    endScreen;
    moves;
    time;
    localLang = "ru";

    constructor() {
        this.startScreen = new StartScreen(this);
        this.gameBoard = new GameBoard(this);
        this.screenManager = new ScreenManager(document.getElementById("screen_main"));
        this.leaderBoard = new Top15_Screen(this);
        this.timer = new Timer(document.getElementById("time"));
        this.endScreen = new EndScreen(this);
    }

    init() {
        this.localLang = localStorage.getItem("language") || localLang;
        const languageSelector = document.getElementById("language-selector");
        languageSelector.value = localLang;

        this.updateLanguage(localLang);

        languageSelector.addEventListener("change", (event) => {
            localLang = event.target.value;
            localStorage.setItem("language", localLang);
            this.updateLanguage(localLang);
        });

        this.screenManager.setInitialScreen(this.startScreen.get());

        // Add event listeners to buttons
        const startRestartButton = document.getElementById("start_restart_btn");
        startRestartButton.addEventListener("click", () => {
            if (!this.state.isGameStarted) {
                this.startGame();
                this.state.isGamePaused = false;
                this.timer.startTimer();
            } else if (!this.state.isGamePaused && this.state.isGameStarted) {
                this.state.isGamePaused = true;
                this.time = document.getElementById("time");
                this.timer.pauseTimer();
            } else if (this.state.isGamePaused && this.state.isGameStarted) {
                this.state.isGamePaused = false;
                this.timer.startTimer();
                this.screenManager.switchTo(this.gameBoard.getElement());
                this.gameBoard.renderTiles();
            } else {
                this.restartGame();
            }
            this.updateLanguage(localLang);
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
        });

        const leaderboardButton = document.getElementById("leaderboard-btn");
        leaderboardButton.textContent = localization[localLang].top15_label;
        leaderboardButton.addEventListener("click", () => {
            this.state.isGamePaused = true;
            this.timer.pauseTimer();
            this.showLeaderboard();
        });
    }

    updateLanguage(lang) {
        localLang = lang;
        if ((!this.state.isGameStarted) || (this.state.isGamePaused && this.state.isGameStarted)) {
            document.getElementById("start_restart_btn").textContent = localization[lang].start_label;
        } else if (!this.state.isGamePaused && this.state.isGameStarted) {
            document.getElementById("start_restart_btn").textContent = localization[lang].pause_label;
        }

        document.getElementById("reset_btn").textContent = localization[lang].exit_label;
        document.getElementById("leaderboard-btn").textContent = localization[lang].top15_label;
        document.getElementById("moves_label").textContent = localization[lang].moves_label;
        document.getElementById("time_label").textContent = localization[lang].time_label;
        document.getElementById("language-label").textContent = localization[lang].lang_label;

        this.startScreen.updateLanguage(lang);
    }

    updateTime() {
        const now = new Date();
    }

    startGame() {
        this.state.isGameStarted = true;
        this.screenManager.switchTo(this.gameBoard.getElement());
        // Initialize the game board and display it
        this.gameBoard.createTilesGameBoard();
        this.gameBoard.renderTiles();
        this.moves = 0;
        this.timer.resetTimer(true);
        this.timer.renderTimer();
        document.getElementById("moves").textContent = "0";
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
        this.screenManager.switchTo(this.startScreen.get());
    }

    showLeaderboard() {
        this.endScreen.writer.then(() => {
            this.screenManager.switchTo(this.leaderBoard.get());
            this.leaderBoard.getLeaderBoardPlayers();
        });
    }

    showEndScreen() {
        this.screenManager.switchTo(this.endScreen.get());
        this.state.isGameStarted = false;
        this.timer.pauseTimer();
        const score = document.getElementsByClassName("score")[0];
        score.textContent = this.scoreCount();
        const button = document.getElementById("start_restart_btn");
        button.textContent = localization[localLang].start_label;
    }

    scoreCount() {
        return this.moves + Math.round(+this.timer.passedTime / 1000);
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
        if (this.gameObject.state.isGamePaused) {
            return;
        }

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
            this.gameObject.movesCount();     // M1
        }

        if (this.victoryDetect()) {
            setTimeout(() => {
                alert("Congrats!!!");
                this.gameObject.showEndScreen();
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
    components = {}

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        this.components.container = document.createElement("div");
        this.components.container.classList.add("start_screen");

        this.components.title = document.createElement("h1");
        this.components.title.id = "start_screen_title";

        this.components.container.append(this.components.title);

        return this.components.container;
    }

    get() {
        return this.element;
    }

    updateLanguage(lang) {
        this.components.title.textContent = localization[lang].game_label;
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
        list.id = "list_15";

        container.append(title);
        container.append(list);

        return container;
    }

    getLeaderBoardPlayers() {
        fetch('http://localhost:3000/api/get_top_players')
            .then(response => response.json())
            .then(data => {
                const listElement = document.getElementById("list_15");
                listElement.textContent = "";
                for (let i = 0; i < data.length; i++) {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${data[i].name} - ${data[i].scores} points`;
                    listElement.append(listItem);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    get() {
        return this.element;
    }
}

class EndScreen {
    gameObject;
    element;
    writer = Promise.resolve();

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("end_screen");
        const title = document.createElement("h1");
        title.textContent = "Congrats!!! Enter Your Name Below";
        const inputName = document.createElement("input");
        inputName.setAttribute("type", "text");
        const button = document.createElement("button");

        button.addEventListener("click", () => {
            this.writer =
                fetch('http://localhost:3000/api/add_player', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({name: inputName.value, scores: this.gameObject.scoreCount()})
                });

            this.writer
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch(error => console.error('Error:', error));

            this.gameObject.showLeaderboard();
        });

        button.textContent = localization[localLang].submit_label;
        const score = document.createElement("div");
        score.classList.add("score");

        container.append(title);
        container.append(inputName);
        container.append(button);
        container.append(score);

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
    time;

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
        this.resetTimer(true);
        clearInterval(this.timeInterval);
    }

    resetTimer(resetView = false) {
        this.startTime = Date.now();
        if (resetView) {
            this.passedTime = new Date(0);
            // this.renderTimer();
        }
    }
}

// Initialize the PuzzleGame
(new PuzzleGame()).init();


/*// Server
GET players
fetch('http://localhost:3000/api/get_top_players')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

POST players
fetch('http://localhost:3000/api/add_player', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'Ansar', scores: 10})
}).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
*/