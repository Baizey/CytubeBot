export class User {
    /**
     * @param {string} name
     * @param {number} lastOnline
     * @param {number} rank
     * @param {boolean} disallow
     * @param {boolean} ignore
     */
    constructor(name, lastOnline, rank, disallow, ignore) {
        this.name = name;
        this.lastOnline = lastOnline;
        this.rank = rank;
        this.disallow = disallow;
        this.ignore = ignore;
    }
}