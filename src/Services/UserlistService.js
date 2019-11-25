import CytubeService from "./CytubeService.js";
import CytubeUser from "./models/CytubeUser.js";
import Rank from "./models/Rank.js";

const Subscribe = {
    add: 'addUser',
    setRank: 'setUserRank',
    leave: 'userLeave',
    userlist: 'userlist',
    setMeta: 'setUserMeta',
    setAfk: 'setAFK'
};

export default class UserlistService {

    /**
     * @param {CytubeService} cytube
     * @param {UserDatabaseAgent} database
     */
    constructor(cytube, database) {
        this._cytube = cytube;
        this._db = database;
        this.online = {};
    }

    subscribe() {
        this._cytube.on(Subscribe.setAfk, data => {
            const user = this.online[data.name];
            if (!user) return;
            user.afk = data.afk;
        });
        this._cytube.on(Subscribe.add, async user => await this.add(CytubeUser.fromCytubeServer(user)));
        this._cytube.on(Subscribe.setRank, async user => await this.update(user.name, {rank: new Rank(user.rank)}));
        this._cytube.on(Subscribe.setMeta, data => {
            const user = this.online[data.name];
            if (!user) return;
            user.muted = data.meta.muted || data.meta.smuted;
            user.afk = (typeof data.afk === 'boolean') ? data.meta.afk : user.afk;
        });
        this._cytube.on(Subscribe.leave, (user) => this.setOffline(user.name));
        this._cytube.on(Subscribe.userlist, (users) => users.forEach(async user => await this.add(CytubeUser.fromCytubeServer(user))));
    }

    /**
     * @param {string|string[]} ignoreNames
     * @returns {CytubeUser[]}
     */
    mods(ignoreNames = []) {
        ignoreNames = Array.isArray(ignoreNames) ? ignoreNames : [ignoreNames];
        return this.online.values()
            .filter(e => e.rank.higherOrEqualThan(Rank.mod))
            .filter(e => !ignoreNames.contains(e.name));
    }

    /**
     * @param {string|string[]} ignoreNames
     * @returns {boolean}
     */
    hasLiveMod(ignoreNames = []) {
        ignoreNames = Array.isArray(ignoreNames) ? ignoreNames : [ignoreNames];
        return this.online.values()
            .filter(e => e.rank.higherOrEqualThan(Rank.mod))
            .filter(e => !ignoreNames.contains(e.name))
            .length > 0;
    }

    /**
     * @param {CytubeUser} user
     * @returns {Promise<void>}
     */
    async add(user) {
        const dbUser = await this.get(user.name);
        // If user already exist, update rank
        if (dbUser) {
            this.online[dbUser.name] = dbUser;
            await this.update(user.name);
        } else {
            // Otherwise insert user
            this.online[user.name] = user;
            await this._db.add(user.asDatabaseUser);
        }
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async setOffline(name) {
        // Update last online to now
        await this.update(name);
        delete this.online[name];
    }

    /**
     * @param {string} name
     * @param {{rank: Rank|undefined, disallow: boolean|undefined, ignore: boolean|undefined}} data
     * @returns {Promise<void>}
     */
    async update(name, data = {}) {
        const user = await this.get(name);
        if (!user) return;

        user.rank = data.rank || user.rank;
        user.disallow = typeof data.disallow === 'boolean'
            ? data.disallow
            : user.disallow;
        user.ignore = typeof data.ignore === 'boolean'
            ? data.ignore
            : user.ignore;

        // Always update lastOnline if nothing else
        await this._db.alter(user.asDatabaseUser);
        if (this.isOnline(name))
            this.online[name] = user;
    }

    /**
     * @param {string} name
     * @returns {Promise<CytubeUser>}
     */
    async get(name) {
        if (this.online[name])
            return this.online[name];
        const dbUser = await this._db.getByName(name);
        return CytubeUser.fromDatabaseUser(dbUser);
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    isOnline(name) {
        return !!this.online[name];
    }


}