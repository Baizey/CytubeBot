export default class AliveLink {

    /**
     * @param {object} link
     * @returns {AliveLink}
     */
    static fromDatabase(link) {
        return link ? new AliveLink(
            link.id,
            link.type,
            link.title,
            link.fullTitle,
            link.year,
            link.duration,
            link.quality,
            link.validateBy
        ) : undefined;
    }

    /**
     * @param {string} id
     * @param {string} type
     * @param {string} title
     * @param {string} fullTitle
     * @param {number} year
     * @param {number} duration
     * @param {string} quality
     * @param {number|string} validateBy
     */
    constructor(id, type, title, fullTitle, year, duration, quality, validateBy) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.fullTitle = fullTitle;
        this.year = year;
        this.duration = duration;
        this.quality = quality;
        this.validateBy = validateBy - 0;
    }
}