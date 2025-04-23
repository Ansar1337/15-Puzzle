"use strict"

import {localization} from "../locals/localization.js";

export class EndScreen {
    gameObject;
    element;
    writer = Promise.resolve();
    components = {};

    constructor(gameObject) {
        this.element = this.createScreen();
        this.gameObject = gameObject;
    }

    createScreen() {
        const container = document.createElement("div");
        container.classList.add("end_screen");
        this.components.title = document.createElement("h1");
        const inputName = document.createElement("input");
        inputName.setAttribute("type", "text");
        this.components.button = document.createElement("button");

        this.components.button.addEventListener("click", () => {
            this.writer =
                fetch(`${this.gameObject.backendURL}/api/add_player`, {
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

        const score = document.createElement("div");
        score.classList.add("score");

        container.append(this.components.title);
        container.append(inputName);
        container.append(this.components.button);
        container.append(score);

        return container;
    }

    updateLanguage(lang) {
        this.components.button.textContent = localization[this.gameObject.localLang].submit_label;
        this.components.title.textContent = localization[this.gameObject.localLang].end_screen_label;
    }

    get() {
        return this.element;
    }
}