import BaseDatabaseAgent from "./BaseDatabaseAgent.js";
import Nomination from "../domain/Nomination.js";

export default class NominationDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        super(context, 'nominations');
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
    deleteByTitle(title) {
        return this.delete().where(e => e.title === $, title)
            .execute()
            .then();
    }

    /**
     * @param {string} name
     * @returns {Promise<void>}
     */
    deleteByUsername(name) {
        return this.delete().where(e => e.username === $, name)
            .execute()
            .then();
    }

    /**
     * @param {string} name
     * @param {string} title
     * @returns {Promise<void>}
     */
    deleteByUsernameAndTitle(name, title) {
        return this.delete().where(e => e.username === $ && e.title === $, name, title)
            .execute()
            .then();
    }

    /**
     * @param {Nomination} nomination
     * @returns {Promise<void>}
     */
    add(nomination) {
        return super.insert(nomination)
            .execute()
            .then();
    }
}