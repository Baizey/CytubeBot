import CytubeService from "./CytubeService.js";
import CytubeUser from "./models/CytubeUser.js";

const Subscribe = {
    add: 'addUser',
    setRank: 'setUserRank',
    leave: 'userLeave',
    get: 'userlist'
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
        this._cytube.on(Subscribe.add, (user) => this.add(CytubeUser.fromCytubeServer(user)));
        this._cytube.on(Subscribe.setRank, (user) => this.update(user.name, {rank: user.rank}));
        this._cytube.on(Subscribe.leave, (user) => this.setOffline(user.name));
        this._cytube.on(Subscribe.get, (users) => this.addAll(users.map(e => CytubeUser.fromCytubeServer(e))));
    }

    /**
     * @param {CytubeUser[]} users
     * @returns {Promise<void>}
     */
    async addAll(users) {
        this.online = {};
        await Promise.all(users.map(e => this.add(e)));
    }

    /**
     * @param {CytubeUser} user
     * @returns {Promise<void>}
     */
    async add(user) {
        const dbUser = await this.get(user.name);
        // If user already exist, only update rank if needed
        if (dbUser) {
            if (dbUser.rank === user.rank) return;
            dbUser.rank = user.rank;
            this.online[user.name] = dbUser;
            await this._db.update(dbUser.asDatabaseUser);
            return;
        }
        // Otherwise insert
        this.online[user.name] = user;
        await this._db.add(user.asDatabaseUser);
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
     * @param {{rank: number|undefined, disallow: boolean|undefined, ignore: boolean|undefined}} data
     * @returns {Promise<void>}
     */
    async update(name, data = {}) {
        const user = this.online[name];

        if (!user) return;

        user.rank = typeof data.rank === 'number'
            ? data.rank
            : user.rank;
        user.disallow = typeof data.disallow === 'boolean'
            ? data.disallow
            : user.disallow;
        user.ignore = typeof data.ignore === 'boolean'
            ? data.ignore
            : user.ignore;

        await this._db.update(user.asDatabaseUser);
    }

    /**
     * @param {string} name
     * @returns {CytubeUser}
     */
    async get(name) {
        if (this.online[name])
            return this.online[name];
        return CytubeUser.fromDatabaseUser(await this._db.getByName(name));
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    isOnline(name) {
        return !!this.online[name];
    }


}