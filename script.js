"use strict"

class PuzzleGame {
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

        // for (let i = this.cells.length - 1; i > 0; i--) {
        //     const j = Math.floor(Math.random() * (i + 1));
        //     [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]];
        // }
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
        const boardSize = Math.sqrt(this.cells.length);
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
            Math.floor(index1 / boardSize) === Math.floor(index2 / boardSize);

        const isValidMove = validMoves.includes(clickedTileIndex) &&
            (isSameRow(emptyTileIndex, clickedTileIndex) ||
                (emptyTileIndex - clickedTileIndex === boardSize || // up
                    clickedTileIndex - emptyTileIndex === boardSize)); // down


        if (isValidMove) {
            // Swap tiles
            [this.cells[emptyTileIndex], this.cells[clickedTileIndex]] = [this.cells[clickedTileIndex], this.cells[emptyTileIndex]];
            this.renderTiles();
        }
    }
}

const puzzleObject = new PuzzleGame(document.getElementsByClassName("game_board")[0], 15);
puzzleObject.createTilesGameBoard();
puzzleObject.renderTiles();
console.log(puzzleObject.victoryDetect());


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