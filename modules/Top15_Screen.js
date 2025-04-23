"use strict"

import {localization} from "../locals/localization.js";

export class Top15_Screen {
    gameObject;
    element;
    components = {};

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("top15_screen");

        this.components.title = document.createElement("h1");

        const list = document.createElement("ol");
        list.id = "list_15";

        container.append(this.components.title);
        container.append(list);

        return container;
    }

    updateLanguage(lang) {
        this.components.title.textContent = localization[lang].top15_heading;
    }

    getLeaderBoardPlayers() {
        fetch(`${this.gameObject.backendURL}/api/get_top_players`)
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