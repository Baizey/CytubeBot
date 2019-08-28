import BaseDatabaseAgent from "./BaseDatabaseAgent.js";
import DeadLink from "../domain/DeadLink.js";

export default class DeadLinksDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        super(context, 'deadlinks');
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
    add(link) {
        return this.insert(link)
            .execute()
            .then();
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<void>}
     */
    remove(id, type) {
        return this.delete().where(e => e.id === $ && e.type === $, id, type)
            .execute()
            .then()
    }

}