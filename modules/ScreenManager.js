"use strict"

export class ScreenManager {
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