"use strict"

const gridContainer = document.createElement("div");

const tableSize = 4;
const cells = [];

for (let i = 0; i < tableSize; i++) {
    const cell = document.createElement("div");
    gridContainer.append(cell);
    cells.push(cell);
}

document.body.append(gridContainer);