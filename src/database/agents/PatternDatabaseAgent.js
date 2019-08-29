import Pattern from '../domain/Pattern.js'
import BaseDatabaseAgent from "./BaseDatabaseAgent.js";

export default class PatternDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        const create = context.create('patterns');
        create.text('regex').primary();
        create.text('command').primary();
        create.text('rest').primary();
        super(context, create);
    }

    /**
     * @returns {Promise<Pattern[]>}
     */
    getAll() {
        return super.select()
            .execute()
            .then(e => e ? e.map(e => Pattern.fromDatabase(e)) : []);
    }

    /**
     * @param {Pattern} pattern
     * @returns {Promise<void>}
     */
    add(pattern) {
        return super.insert(pattern)
            .execute()
            .then();
    }

    /**
     * @param {string} command
     * @returns {Promise<void>}
     */
    deleteByCommand(command) {
        return this.delete().where(e => e.command === $, command)
            .execute()
            .then();
    }
}