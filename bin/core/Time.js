const utils = require("./Utils");

class Time {

    /**
     * @param {Number|String} millis
     * @param {Number} seconds
     * @param {Number} minutes
     * @param {Number} hours
     * @param {Number} days
     * @returns {Time}
     */
    static from(millis = 0, seconds = 0, minutes = 0, hours = 0, days = 0) {
        return new Time(millis, seconds, minutes, hours, days);
    }

    /**
     * @returns {Time}
     * @param {Number} min
     * @param {Number} max
     */
    static fromMillis(min = 0, max = min) {
        return Time.from(utils.random(min, max));
    }

    /**
     * @returns {Time}
     * @param {Number} min
     * @param {Number} max
     */
    static fromSeconds(min = 0, max = min) {
        return Time.from(0, utils.random(min, max));
    }

    /**
     * @returns {Time}
     * @param {Number} min
     * @param {Number} max
     */
    static fromMinutes(min = 0, max = min) {
        return Time.from(0, 0, utils.random(min, max));
    }

    /**
     * @returns {Time}
     * @param {Number} min
     * @param {Number} max
     */
    static fromHours(min = 0, max = min) {
        return Time.from(0, 0, 0, utils.random(min, max));
    }

    /**
     * @returns {Time}
     * @param {Number} min
     * @param {Number} max
     */
    static fromDays(min = 0, max = min) {
        return Time.from(0, 0, 0, 0, utils.random(min, max));
    }

    /**
     * @returns {Time}
     */
    static current() {
        return Time.from(Date.now());
    }

    /**
     * @param {Number|String} millis
     * @param {Number} seconds
     * @param {Number} minutes
     * @param {Number} hours
     * @param {Number} days
     */
    constructor(millis = 0, seconds = 0, minutes = 0, hours = 0, days = 0) {
        if (typeof millis === "string") {
            const temp = millis.split(":");
            millis = 0;
            seconds = temp.length <= 0 ? 0 : temp[temp.length - 1] - 0;
            minutes = temp.length <= 1 ? 0 : temp[temp.length - 2] - 0;
            hours = temp.length <= 2 ? 0 : temp[temp.length - 3] - 0;
        }
        hours += days * 24;
        minutes += hours * 60;
        seconds += minutes * 60;
        this._millis = Math.round(millis + seconds * 1000);
    }

    /**
     * @returns {number}
     */
    get days() {
        return Math.floor(this.hours / 24);
    }

    /**
     * @returns {number}
     */
    get hours() {
        return Math.floor(this.minutes / 60);
    }

    /**
     * @returns {number}
     */
    get minutes() {
        return Math.floor(this.seconds / 60);
    }

    /**
     * @returns {number}
     */
    get seconds() {
        return Math.floor(this.millis / 1000);
    }

    /**
     * @returns {number}
     */
    get millis() {
        return this._millis;
    }

    /**
     * Time scaled to best fitting unit
     * @returns {string}
     */
    get asUnit() {
        const scale = [            1,     1000,       60,     60,    24];
        const names = ["millisecond", "second", "minute", "hour", "day"];
        let time = this.millis;
        let i = 1;
        for (; i < names.length; i++) {
            const temp = time / scale[i];
            if (temp < 1) break;
            time = temp;
        }
        return `${time.toFixed(2)} ${names[i - 1]}${time > 1 ? 's' : ''}`;
    }

    /**
     * @returns {String} Time in HH:MM:SS format
     */
    get asPlaytime() {
        const seconds = Math.abs(this.seconds);
        const hr = `${Math.floor(seconds / 3600)}`.padStart(2, '0');
        const min = `${Math.floor(Math.floor(seconds / 60) % 60)}`.padStart(2, '0');
        const sec = `${Math.floor(seconds % 60)}`.padStart(2, '0');
        return `${hr}:${min}:${sec}`;
    }

    /**
     * @param {Time} other
     * @returns {boolean}
     */
    isBiggerThan(other) {
        return this.millis > other.millis;
    }

    /**
     * @param {Time} other
     * @returns {boolean}
     */
    isEqual(other) {
        return this.millis === other.millis;
    }

    /**
     * @param {Time} other
     * @returns {boolean}
     */
    isSmallerThan(other) {
        return this.millis < other.millis;
    }


    /**
     * @returns {Boolean}
     */
    isNegative() {
        return this.millis < 0;
    }

    /**
     * @returns {Boolean}
     */
    isPositive() {
        return this.millis > 0;
    }

    /**
     * @returns {Boolean}
     */
    isZero() {
        return this.millis === 0;
    }

    /**
     * @param {String|Number|Time} millis
     * @param {Number} seconds
     * @param {Number} minutes
     * @param {Number} hours
     * @param {Number} days
     */
    add(millis = 0, seconds = 0, minutes = 0, hours = 0, days = 0) {
        if (millis instanceof Time)
            this._millis += millis.millis;
        else
            this._millis += new Time(millis, seconds, minutes, hours, days).millis;
        this._millis = Math.round(this._millis);
        return this;
    }

    /**
     * @param {Number} minMillis
     * @param {Number} maxMillis
     */
    addMillis(minMillis = 0, maxMillis = minMillis) {
        this.add(Time.fromMillis(minMillis, maxMillis));
        return this;
    }

    /**
     * @param {Number} minSeconds
     * @param {Number} maxSeconds
     */
    addSeconds(minSeconds = 0, maxSeconds = minSeconds) {
        this.add(Time.fromSeconds(minSeconds, maxSeconds));
        return this;
    }

    /**
     * @param {Number} minMinutes
     * @param {Number} maxMinutes
     */
    addMinutes(minMinutes = 0, maxMinutes = minMinutes) {
        this.add(Time.fromMinutes(minMinutes, minMinutes));
        return this;
    }

    /**
     * @param {Number} minHours
     * @param {Number} maxHours
     */
    addHours(minHours = 0, maxHours = minHours) {
        this.add(Time.fromHours(minHours, maxHours));
        return this;
    }

    /**
     * @param {Number} minDays
     * @param {Number} maxDays
     */
    addDays(minDays = 0, maxDays = minDays) {
        this.add(Time.fromDays(minDays, maxDays));
        return this;
    }
}

module.exports = Time;