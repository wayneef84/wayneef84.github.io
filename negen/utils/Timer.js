export default class Timer {
    constructor() {
        this.timers = [];
    }

    /**
     * Add a one-off timer.
     * @param {number} duration Duration in milliseconds
     * @param {Function} callback Function to call when time is up
     */
    add(duration, callback) {
        this.timers.push({
            duration: duration,
            elapsed: 0,
            callback: callback
        });
    }

    update(dt) {
        // dt is in milliseconds
        for (let i = this.timers.length - 1; i >= 0; i--) {
            const timer = this.timers[i];
            timer.elapsed += dt;
            if (timer.elapsed >= timer.duration) {
                timer.callback();
                this.timers.splice(i, 1);
            }
        }
    }
}
