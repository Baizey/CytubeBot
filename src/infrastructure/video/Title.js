export default class Title {

    static filter(fullTitle) {

    }

    /**
     * @param {string} full
     * @param {string} filtered
     * @param {number} year
     * @param {string} quality
     */
    constructor(full, filtered, year, quality) {
        this.full = full;
        this.filtered = filtered;
        this.year = year;
        this.quality = quality;
    }

}