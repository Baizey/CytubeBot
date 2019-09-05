import DatabasePattern from '../domain/DatabasePattern.js'
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
     * @returns {Promise<DatabasePattern[]>}
     */
    getAll() {
        return super.select()
            .execute()
            .then(e => e ? e.map(e => DatabasePattern.fromDatabase(e)) : []);
    }

    /**
     * @param {DatabasePattern} pattern
     * @returns {Promise<void>}
     */
    async add(pattern) {
        await super.insert(pattern).execute();
    }

    /**
     * @param {string} command
     * @returns {Promise<void>}
     */
    async deleteByCommand(command) {
        await this.delete().where(e => e.command === $, command).execute();
    }
}