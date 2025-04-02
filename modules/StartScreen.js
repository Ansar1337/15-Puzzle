"use strict"

import {localization} from "../locals/localization.js";

export class StartScreen {
    gameObject;
    element;
    components = {};

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