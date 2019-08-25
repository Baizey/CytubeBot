export class Nomination {
    /**
     * @param {User} user
     * @param {string} title
     * @param {number} year
     */
    constructor(user, title, year) {
        this.user = user;
        this.title = title;
        this.year = year;
    }
}