export default class Title {

    static filter(fullTitle) {
        const imdbIds = fullTitle.match(/tt\d{8,}/g) || [];
        const imdb = imdbIds[0];

        

    }

    /**
     * @param {string} full
     * @param {string} filtered
     * @param {number} year
     * @param {string} quality
     * @param {string} imdbId
     */
    constructor(full, filtered, year, quality, imdbId) {
        this.full = full;
        this.filtered = filtered;
        this.year = year;
        this.quality = quality;
        this.imdbId = imdbId;
    }

}