import CytubeService from "./CytubeService.js";
import CytubeUser from "./models/CytubeUser.js";

const Subscribe = {
    add: 'addUser',
    setRank: 'setUserRank',
    leave: 'userLeave',
    userlist: 'userlist'
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
        this._cytube.on(Subscribe.userlist, (users) => this.addAll(users.map(e => CytubeUser.fromCytubeServer(e))));
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
        // If user already exist, update rank
        if (dbUser) {
            this.online[user.name] = dbUser;
            await this.update(user.name, {rank: user.rank});
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

        // Always update lastOnline if nothing else
        await this._db.alter(user.asDatabaseUser);
    }

    /**
     * @param {string} name
     * @returns {Promise<CytubeUser>}
     */
    async get(name) {
        if (this.online[name])
            return Promise.resolve(this.online[name]);
        const dbUser = await this._db.getByName(name);
        const user = CytubeUser.fromDatabaseUser(dbUser);
        return user;
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    isOnline(name) {
        return !!this.online[name];
    }


}