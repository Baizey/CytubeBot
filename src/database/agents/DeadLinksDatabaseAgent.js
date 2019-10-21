import BaseDatabaseAgent from "./BaseDatabaseAgent.js";
import DeadLink from "../domain/DeadLink.js";

export default class DeadLinksDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        const create = context.create('deadlinks');
        create.text('id').primary();
        create.text('type').primary();
        super(context, create);
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<DeadLink[]>}
     */
    getByIdAndType(id, type) {
        return this.select().where(e => e.id === $ && e.type === $, id, type)
            .execute()
            .then(r => r ? DeadLink.fromDatabase(r[0]) : null)
    }

    /**
     * @param {DeadLink} link
     * @returns {Promise<void>}
     */
    async add(link) {
        await this.insert(link).execute();
    }

    /**
     * @param {DeadLink} link
     * @returns {Promise<void>}
     */
    async remove(link) {
        await super.delete()
            .where(e => e.id === $ && e.type === $, link.id, link.type)
            .execute();
    }

}