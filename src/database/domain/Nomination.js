export default class Nomination {

    /**
     * @param {object} pattern
     * @returns {Nomination}
     */
    static fromDatabase(pattern) {
        return pattern ? new Nomination(pattern.username, pattern.title, pattern.year) : null;
    }

    /**
     * @param {User} username
     * @param {string} title
     * @param {number} year
     */
    constructor(username, title, year) {
        this.username = username;
        this.title = title;
        this.year = year;
    }
}