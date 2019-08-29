import BaseDatabaseAgent from "./BaseDatabaseAgent.js";
import Nomination from "../domain/Nomination.js";

export default class NominationDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        const create = context.create('nominations');
        create.text('username').primary().reference('users', 'name');
        create.text('title').primary();
        create.int('year').default(0);
        super(context, create);
    }

    /**
     * @returns {Promise<Nomination[]>}
     */
    getAll() {
        return super.select()
            .execute()
            .then(e => e ? e.map(e => Nomination.fromDatabase(e)) : []);
    }

    /**
     * @param {string[]} names
     * @returns {Promise<Nomination[]>}
     */
    getByUsernames(names) {
        return this.select().where(e => e.username in $, names)
            .execute()
            .then(e => e ? e.map(e => Nomination.fromDatabase(e)) : []);
    }

    /**
     * @param {string} name
     * @returns {Promise<Nomination[]>}
     */
    getByUsername(name) {
        return this.select().where(e => e.username === $, name)
            .execute()
            .then(e => e ? e.map(e => Nomination.fromDatabase(e)) : []);
    }

    /**
     * @param {string} name
     * @param {string} title
     * @returns {Promise<Nomination>}
     */
    getByUsernameAndTitle(name, title) {
        return this.select().where(e => e.username === $ && e.title === $, name, title)
            .execute()
            .then(e => e ? e.map(e => Nomination.fromDatabase(e)) : []);
    }

    /**
     * @param {string} title
     * @returns {Promise<void>}
     */
    async deleteByTitle(title) {
        await this.delete().where(e => e.title === $, title).execute();
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    async deleteByUsername(name) {
        await this.delete().where(e => e.username === $, name).execute();
    }

    /**
     * @param {string} name
     * @param {string} title
     * @returns {Promise<void>}
     */
    async deleteByUsernameAndTitle(name, title) {
        await this.delete().where(e => e.username === $ && e.title === $, name, title).execute();
    }

    /**
     * @param {Nomination} nomination
     * @returns {Promise<void>}
     */
    async add(nomination) {
        await super.insert(nomination).execute();
    }
}