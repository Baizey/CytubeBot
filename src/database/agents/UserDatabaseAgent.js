import DatabaseUser from '../domain/DatabaseUser.js'
import BaseDatabaseAgent from "./BaseDatabaseAgent.js";

export default class UserDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        const create = context.create('users');
        create.text('name').primary();
        create.int('lastonline').default(0);
        create.int('rank').default(0);
        create.bool('disallow').default(false);
        create.bool('ignore').default(false);
        super(context, create);
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
    async add(user) {
        await super.insert(user).execute()
    }

    /**
     * @param {DatabaseUser} user
     * @returns {Promise<void>}
     */
    async alter(user) {
        await super.update(user).where(e => e.name === $, user.name).execute();
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteByName(name) {
        await super.delete().where(e => e.name === $, name).execute();
    }
}