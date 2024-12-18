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

class PuzzleGame {

    // 1. Create div and classList.add game_board style

    gameBoard;
    tableSize;
    cells = [];


    constructor(gameBoard, tableSize = 15) {
        this.gameBoard = gameBoard;
        this.tableSize = tableSize;
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
            this.gameBoard.append(this.cells[i]);
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

class GameBoard {
    container;

    constructor(parentElement) {
        this.container = document.createElement("div");
        this.container.classList.add("game_board");
        parentElement.append(this.container);
    }

    getElement() {
        return this.container;
    }
}

/*class StartScreen {
    startScreen = document.getElementsByClassName("screen_container");
    title = "Welcome to Fifteen Game";


    constructor(startScreen, title) {
        this.startScreen = startScreen;
        this.title = title;
    }

    // Создать стартовый экран с дивом и заголовком
    //
}*/

/*Screen Main
* */
class ScreenMain {

}

const appContainer = document.getElementById("screen_main");
const gameBoardNew = new GameBoard(appContainer);
const puzzleGame = new PuzzleGame(gameBoardNew.getElement(), 15);


// const startButton = document.getElementById("start_restart_btn");
// const resetButton = document.getElementById("reset_btn");

puzzleGame.createTilesGameBoard();
puzzleGame.renderTiles();
console.log(puzzleGame.victoryDetect());

// startButton.addEventListener("click", () => {
//     puzzleGameObject.startGame();
// });
//
// resetButton.addEventListener("click", () => {
//     puzzleGameObject.resetGame();
// });


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