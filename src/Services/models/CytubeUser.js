import DatabaseUser from "../../database/domain/DatabaseUser.js";
import Rank from "./Rank.js";

export default class CytubeUser {

    /**
     * @param {{name: string, rank:number}} data
     * @returns {CytubeUser}
     */
    static fromCytubeServer(data) {
        const user = new CytubeUser(data.name, data.rank);
        if (data.meta) {
            user.muted = data.meta.muted || data.meta.smuted;
            user.afk = data.meta.afk;
        }
        if (user.name === 'Baizey') user.rank = Rank.dev;
        return user;
    }

    /**
     * @param {DatabaseUser} user
     * @returns {CytubeUser}
     */
    static fromDatabaseUser(user) {
        if (!user) return undefined;
        const u = new CytubeUser(user.name, user.rank, user.disallow, user.ignore, user.lastOnline);
        if (u.name === 'Baizey') u.rank = Rank.dev;
        return u;
    }

    /**
     * @param {string} name
     * @param {number} lastOnline
     * @param {number} rank
     * @param {boolean} disallow
     * @param {boolean} ignore
     */
    constructor(name, rank, disallow = false, ignore = false, lastOnline = Date.now()) {
        this.name = name;
        this.rank = new Rank(rank);
        this.disallow = disallow;
        this.ignore = ignore;
        this.lastOnline = new Date(lastOnline);
        this.muted = false;
        this.afk = false;
    }

    /**
     * @param {CytubeUser} victim
     * @returns {boolean}
     */
    higherRankThan(victim) {
        return this.rank.higherThan(victim.rank);
    }

    /**
     * @param {CytubeUser} victim
     * @returns {boolean}
     */
    higherOrEqualRankThan(victim) {
        return this.rank.higherOrEqualThan(victim.rank);
    }

    /**
     * @returns {DatabaseUser}
     */
    get asDatabaseUser() {
        this.lastOnline = new Date();
        return new DatabaseUser(this.name, this.lastOnline.getTime(), this.rank.value, this.disallow, this.ignore);
    }
}