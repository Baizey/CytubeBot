export default class DatabaseUser {

    /**
     * @param {object} user
     * @returns {DatabaseUser}
     */
    static fromDatabase(user) {
        return user ? new DatabaseUser(user.name, user.lastonline, user.rank, user.disallow, user.ignore) : null;
    }

    /**
     * @param {string} name
     * @param {number} lastOnline
     * @param {number} rank
     * @param {boolean} disallow
     * @param {boolean} ignore
     */
    constructor(name, lastOnline, rank, disallow, ignore) {
        this.name = name;
        this.lastOnline = lastOnline - 0;
        this.rank = rank;
        this.disallow = disallow;
        this.ignore = ignore;
    }
}