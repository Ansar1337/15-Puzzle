"use strict"

export class GameBoard {
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

// 1. Анимация на клик
    // 2. При клике тайл должен слайдится в валидное направление (right, left, top, bottom)
    // 3. Вычисление координат через getBoundingClientRect()

    // 4.1  1-ый листенер делает transform(translate) на n-ую дистанцию ;
    // 4.2  2-ой листенер завязан на transitionend и принимает наш transform(translate)
    // 4.3  во 2-ом листенере происходит moveTile и сбрасывается transform(translate)
    // 4.4 происходит оффсет тайлов
    createTile(number) {
        const tile = document.createElement("div");
        tile.classList.add("puzzle_item");
        tile.textContent = number.toString();
        tile.dataset.number = number;

        // Handle tile click
        tile.addEventListener("click", (e) => {
            if (number !== this.cells.length + 1 && this.isValidMove(tile)) {
                const rect = tile.getBoundingClientRect();
                const emptyTile = document.querySelector('[data-number="16"]');
                const rectEmptyTile = emptyTile.getBoundingClientRect();
                console.log(tile.getBoundingClientRect());
                const distanceX = rectEmptyTile.x - rect.x;
                const distanceY = rectEmptyTile.y - rect.y;
                tile.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
            }
        });

        let moveAllowed = true;
        tile.addEventListener("transitionend", (e) => {
            if (e.propertyName === "transform" && moveAllowed) {
                tile.style.transition = "none";
                tile.style.transform = 'translate(0px, 0px)';
                tile.style.transition = "";
                this.moveTile(tile);
            } else if (!moveAllowed) {
                moveAllowed = true;
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

        // finding empty tile
        const emptyTileIndex = this.cells.findIndex((tile) => {
            return tile.dataset.number === (this.cells.length).toString();
        });

        // defining index of clicked tile
        const clickedTileIndex = this.cells.indexOf(clickedTile);

        // swapping of tiles
        if (this.isValidMove(clickedTile)) {
            // Swap tiles
            [this.cells[emptyTileIndex], this.cells[clickedTileIndex]] = [this.cells[clickedTileIndex], this.cells[emptyTileIndex]];
            this.renderTiles();
            this.gameObject.movesCount();
        }

        if (this.victoryDetect()) {
            setTimeout(() => {
                // alert("Congrats!!!");
                this.gameObject.showEndScreen();
            }, 0);
        }
    }

    reset() {
        this.cells = [];
        this.container.innerHTML = "";
    }

    isValidMove(clickedTile) {
        const rowSize = Math.sqrt(this.cells.length);

        const emptyTileIndex = this.cells.findIndex((tile) => {
            return tile.dataset.number === (this.cells.length).toString();
        });

        const clickedTileIndex = this.cells.indexOf(clickedTile);

        // array of valid moves
        const validMoves = [
            emptyTileIndex - 1, // Left
            emptyTileIndex + 1, // Right
            emptyTileIndex - Math.sqrt(this.cells.length), // Up
            emptyTileIndex + Math.sqrt(this.cells.length)  // Down
        ];

        const isSameRow = (index1, index2) =>
            Math.floor(index1 / rowSize) === Math.floor(index2 / rowSize);

        // returning validMove with checks on click index and same row
        return validMoves.includes(clickedTileIndex) &&
            (isSameRow(emptyTileIndex, clickedTileIndex) ||
                (emptyTileIndex - clickedTileIndex === rowSize || // up
                    clickedTileIndex - emptyTileIndex === rowSize)); // down
    }
}