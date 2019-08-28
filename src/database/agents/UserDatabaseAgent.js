import DatabaseUser from '../domain/DatabaseUser.js'
import BaseDatabaseAgent from "./BaseDatabaseAgent.js";

export default class UserDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        super(context, 'users');
    }

    /**
     * @param {string} name
     * @returns {Promise<DatabaseUser>}
     */
    getByName(name) {
        return super.select().where(e => e.name === $, name)
            .execute()
            .then(e => e ? DatabaseUser.fromDatabase(e[0]) : null)
    }

    /**
     * @param {string} name
     * @returns {Promise<DatabaseUser[]>}
     */
    getContainingName(name) {
        // noinspection EqualityComparisonWithCoercionJS
        return super.select().where(e => e.name == $, `%${name}%`)
            .execute()
            .then(e => e ? e.map(user => DatabaseUser.fromDatabase(user)) : [])
    }

    /**
     * @param {DatabaseUser} user
     * @returns {Promise<void>}
     */
    add(user) {
        return super.insert(user)
            .execute()
            .then();
    }

    /**
     * @param {DatabaseUser} user
     * @returns {Promise<void>}
     */
    alter(user) {
        return super.update(user).where(e => e.name === $, user.name)
            .execute()
            .then();
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    deleteByName(name) {
        return super.delete().where(e => e.name === $, name)
            .execute()
            .then();
    }
}