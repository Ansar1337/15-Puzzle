"use strict"

/*
class PuzzleGame {
    state = {
        isGameLaunched: false,
        isGamePaused: false,
        isGameOver: false,
    };

    resetGame() {
        this.state.isGameOver = false;
        this.createTilesGameBoard();
        this.renderTiles();
    }

    startGame() {
        this.state.isGameLaunched = true;

        // Clear the content
        this.gameBoard.innerHTML = "";
        const heading = document.createElement("h1");
        heading.textContent = "Fifteen Game";
        heading.classList.add("game_heading");
        this.gameBoard.append(heading);


        this.resetGame();
    }

}*/

/*Coздать класс ScreenManager
* который будет выполнять логику свитчинга экранов с помощью replaceWith()
*  currentScreen это обьект ScreenManager класса который отвечает за текущий на данный момент экран
*  */

class ScreenManager {
    currentScreen = null;

    setInitialScreen(initialScreen) {
        document.body.append(initialScreen);
        this.currentScreen = initialScreen;
    }

    switchTo(newScreen) {
        if (this.currentScreen) {
            this.currentScreen.replaceWith(newScreen);
        } else {
            document.body.append(newScreen);
        }
        this.currentScreen = newScreen;
    }
}


/*class GameBoardScreen {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.element = this.createScreen();
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("game_board_container");

        container.appendChild(this.gameBoard.getElement());


        return container;
    }

    get() {
        return this.element;
    }
}*/


class PuzzleGame {
    state = {
        isGameStarted: false,
        isGamePaused: false,
        isGameOver: false,
    };

    gameBoard;
    screenManager;
    timer;
    startScreen;

    constructor() {
        this.startScreen = new StartScreen();
        this.gameBoard = new GameBoard();
        this.screenManager = new ScreenManager();
        this.timer = new Timer();
    }

    init() {
        this.screenManager.setInitialScreen(this.startScreen.get());
    }

    startGame() {
        this.state.isGameStarted = true;

        this.gameBoard.createTilesGameBoard();
        this.gameBoard.renderTiles();
        this.screenManager.switchTo(this.gameBoard.get());
    }

    restartGame() {
        if (!this.state.isGameStarted) {
            return;
        }

        this.gameBoard.createTilesGameBoard();
        this.gameBoard.renderTiles();
    }

    showStartScreen() {
        const startScreen = new StartScreen(() => this.startGame());
        this.screenManager.switchTo(startScreen.get());
    }
}

// Start game logic
// проверка на стэйт игры, isGameLaunched
// свитчинг экранов с помощью screenManager

class GameBoard {
    container;
    cells = [];
    tableSize;


    constructor() {
        this.container = this.createScreen();
        this.tableSize = 15;
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
        for (let i = 0; i < this.tableSize; i++) {
            this.cells.push(this.createTile(i + 1));
        }

        for (let i = this.cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]];
        }
        this.cells.push(this.createTile(this.tableSize + 1));
    }

    createTile(number) {
        const tile = document.createElement("div");
        tile.classList.add("puzzle_item");
        tile.textContent = number.toString();
        tile.dataset.number = number;
        tile.addEventListener("click", () => {
            if (number !== this.cells.length + 1) {
                this.moveTile(tile);
            }
        });
        return tile;
    }

    renderTiles() {
        for (let i = 0; i < this.cells.length; i++) {
            this.container.append(this.cells[i]);
        }
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
}

class StartScreen {
    constructor() {
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

// const appContainer = document.getElementById("screen_main");
// const gameBoard = new GameBoard(appContainer, 15);
// const screenManager = new ScreenManager();
//
//
// const startScreen = new StartScreen(() => {
//     puzzleGame.startGame();
// });
// screenManager.setInitialScreen(startScreen);
// document.body.append(startScreen.get());
//
// const puzzleGame = new PuzzleGame(gameBoard, screenManager, startScreen);
//
//
// const startButton = document.getElementById("start_restart_btn");
// const resetButton = document.getElementById("reset_btn");
//
//
// startButton.addEventListener("click", () => {
//     puzzleGame.startGame();
// });
//
// resetButton.addEventListener("click", () => {
//     puzzleGame.showStartScreen();
// });
//
//
//
// puzzleGame.showStartScreen();

// Puzzle Game Init
(new PuzzleGame()).init();

//


// "Start/Restart" button
const startRestartButton = document.getElementById("start_restart_btn");


startRestartButton.addEventListener("click", () => {
    const timer = new Timer();
    timer.startTimer();
});
//
//
// startRestartButton.addEventListener("click", () => {
//     puzzleGame.startGame(); // Start the game when the button is clicked
// });


// gameBoard.createTilesGameBoard();
// gameBoard.renderTiles();
// console.log(gameBoard.victoryDetect());


// 1. Нужно добавить пустую клетку в массив. Желательно, добавлять ее после шафлинга в конце и находиться она будет тогда на последней ячейке
// 2. Примерный метод перемещения по массиву:
//     +1 = right, -1 = left, +4 = down, -4= up
// 3. Так как пустая клетка только одна, кликнутая нами клетка может занять только ее одно место, при успешном проходе вышеперечисленного условия клетка свапается местами с пустой клеткой.
// 4. Валидация победы: Когда числа идут от наименшего к наибольшому по порядку (1-15).
// 5. Функция которая считывает позицию клеток. При клике на клетку происходит проверка из шага 2

// 6. Добавить проверку на горизонтальное перемещение фишек,

// const testArray = [1, 2, 3, 4, 5];
// const testArray2 = [1, 3, 6, 7, 5];
// const testArray3 = [1, 2, 3, 4, 6];
//
// function victoryDetect(array) {
//     for (let i = 0; i <= array.length - 1; i++) {
//         if (array[i] !== i + 1) {
//             return false;
//         }
//     }
//     return true;
// }
//
// console.log(victoryDetect(testArray));
// console.log(victoryDetect(testArray2));
// console.log(victoryDetect(testArray3));