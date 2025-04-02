"use strict"

import {ScreenManager} from "./ScreenManager.js";
import {GameBoard} from "./GameBoard.js";
import {StartScreen} from "./StartScreen.js";
import {EndScreen} from "./EndScreen.js";
import {Top15_Screen} from "./Top15_Screen.js";
import {Timer} from "./Timer.js";
import {localization} from "../locals/localization.js";

export class PuzzleGame {
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
        this.localLang = localStorage.getItem("language") || this.localLang;
        const languageSelector = document.getElementById("language-selector");
        languageSelector.value = this.localLang;

        this.updateLanguage(this.localLang);

        languageSelector.addEventListener("change", (event) => {
            this.localLang = event.target.value;
            localStorage.setItem("language", this.localLang);
            this.updateLanguage(this.localLang);
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
            this.updateLanguage(this.localLang);
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
        leaderboardButton.textContent = localization[this.localLang].top15_label;
        leaderboardButton.addEventListener("click", () => {
            this.state.isGamePaused = true;
            this.timer.pauseTimer();
            this.showLeaderboard();
        });
    }

    updateLanguage(lang) {
        this.localLang = lang;
        if ((!this.state.isGameStarted) || (this.state.isGamePaused && this.state.isGameStarted)) {
            document.getElementById("start_restart_btn").textContent = localization[lang].start_label;
        } else if (!this.state.isGamePaused && this.state.isGameStarted) {
            document.getElementById("start_restart_btn").textContent = localization[lang].pause_label;
        }

        document.getElementById("reset_btn").textContent = localization[lang].exit_label;
        document.getElementById("leaderboard-btn").textContent = localization[lang].top15_label;
        document.getElementById("moves_label").textContent = localization[lang].moves_label;
        document.getElementById("time_label").textContent = localization[lang].time_label;

        this.startScreen.updateLanguage(lang);
        this.leaderBoard.updateLanguage(lang);
        this.endScreen.updateLanguage(lang);
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
        button.textContent = localization[this.localLang].start_label;
    }

    scoreCount() {
        return this.moves + Math.round(+this.timer.passedTime / 1000);
    }
}