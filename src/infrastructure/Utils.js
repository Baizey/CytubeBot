export default class Utils {

    /**
     * Await a given time in milliseconds or until a function returns true
     * @param {number|function:boolean} time
     * @returns {Promise<void>}
     */
    static await(time = 500) {
        if (typeof time === 'number')
            return new Promise(resolve => {
                setTimeout(() => resolve(), time);
            });
        return new Promise(async resolve => {
            while (!time())
                await Utils.await(250);
            resolve();
        });
    }

    /**
     * @returns {TimeFormatter}
     */
    static get time() {
        return TimeFormatter;
    }
}

export class TimeFormatter {
    /**
     * @param time
     * @returns {TimeFormatter}
     */
    static days(time) {
        return new TimeFormatter(0, 0, 0, 0, time);
    }

    /**
     * @param time
     * @returns {TimeFormatter}
     */
    static hours(time) {
        return new TimeFormatter(0, 0, 0, time);
    }

    /**
     * @param time
     * @returns {TimeFormatter}
     */
    static minutes(time) {
        return new TimeFormatter(0, 0, time);
    }

    /**
     * @param time
     * @returns {TimeFormatter}
     */
    static seconds(time) {
        return new TimeFormatter(0, time);
    }

    /**
     * @param time
     * @returns {TimeFormatter}
     */
    static millis(time) {
        return new TimeFormatter(time);
    }

    /**
     * @param {number} milliseconds
     * @param {number} seconds
     * @param {number} minutes
     * @param {number} hours
     * @param {number} days
     */
    constructor(milliseconds = 0, seconds = 0, minutes = 0, hours = 0, days = 0) {
        hours += 24 * days;
        minutes += 60 * hours;
        seconds += 60 * minutes;
        this._millis = Math.round(milliseconds + 1000 * seconds);
    }

    /**
     * @returns {number}
     */
    get millis() {
        return this._millis;
    }

    /**
     * @returns {number}
     */
    get seconds() {
        return Math.round(this.millis / 1000);
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
    get hours() {
        return Math.floor(this.minutes / 60);
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
    get weeks() {
        return Math.floor(this.days / 7);
    }

    /**
     * @returns {number}
     */
    get months() {
        // roughly 30.436 days or 4.348 weeks per month
        return Math.floor(this.weeks / 4.348);
    }

    /**
     * @returns {number}
     */
    get years() {
        // Roughly 365.232 days per year
        return Math.floor(this.months / 12);
    }


    /**
     * @returns {string}
     */
    get exactString() {
        const data = [
            {time: this.years, unit: 'year',},
            {time: this.months % 12, unit: 'month',},
            {time: Math.floor(this.weeks % 4.348), unit: 'week',},
            {time: this.days % 7, unit: 'day',},
            {time: this.hours % 24, unit: 'hour'},
            {time: this.minutes % 60, unit: 'minute'},
            {time: this.seconds % 60, unit: 'second'}
        ]
            .filter(e => e.time)
            .map(e => `${e.time} ${e.unit}${e.time !== 1 ? 's' : ''}`);
        return `${data.slice(0, -1).join(', ')} and ${data.slice(-1)}`;
    }
}