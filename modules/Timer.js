"use strict"

export class Timer {
    startTime;
    passedTime = 0;
    timeInterval;
    paused = false;
    running = false;
    object;
    time;

    constructor(object) {
        this.object = object;
    }

    renderTimer() {
        const minutes = (this.passedTime.getUTCMinutes()).toString().padStart(2, '0');
        const seconds = (this.passedTime.getUTCSeconds()).toString().padStart(2, '0');
        this.object.textContent = `${minutes}:${seconds}`;
    }

    startTimer() {
        if (this.running) {
            console.log("Таймер уже работает");
            return;
        }
        this.running = true;
        this.paused = false;

        this.timeInterval = setInterval(() => {
            const currentTime = Date.now();
            this.passedTime = new Date(currentTime - this.startTime);
            this.renderTimer();
        }, 1000);
        this.startTime = Date.now() - this.passedTime;
    }

    pauseTimer() {
        this.paused = true;
        this.running = false;
        clearInterval(this.timeInterval);
    }

    stopTimer() {
        this.paused = false;
        this.running = false;
        this.resetTimer(true);
        clearInterval(this.timeInterval);
    }

    resetTimer(resetView = false) {
        this.startTime = Date.now();
        if (resetView) {
            this.passedTime = new Date(0);
            // this.renderTimer();
        }
    }
}