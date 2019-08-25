import {Link} from "./Link";

class AliveLink extends Link {
    /**
     * @param {string} id
     * @param {string} type
     * @param {string} title
     * @param {string} fullTitle
     * @param {number} year
     * @param {number} duration
     * @param {string} quality
     * @param {number} validateBy
     */
    constructor(id, type, title, fullTitle, year, duration, quality, validateBy) {
        super(id, type);
        this.title = title;
        this.fullTitle = fullTitle;
        this.year = year;
        this.duration = duration;
        this.quality = quality;
        this.validateBy = validateBy;
    }
}