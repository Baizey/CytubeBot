import BaseDatabaseAgent from "./BaseDatabaseAgent.js";
import PlaylistVideo from "../../Services/models/PlaylistVideo.js";
import AliveLink from "../domain/AliveLink.js";

export default class AliveLinksDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        const create = context.create('videos');
        create.text('id').primary();
        create.text('type').primary();
        create.text('title');
        create.text('fulltitle');
        create.int('year').default(0);
        create.int('duration').default(0);
        create.text('quality');
        create.bigint('validateBy').default(0);
        super(context, create);
    }

    /**
     * @param {AliveLink} link
     * @returns {Promise<void>}
     */
    async add(link) {
        await super.insert(link).execute();
    }

    /**
     * @param title
     * @returns {Promise<AliveLink[]>}
     */
    async getLike(title) {
        return await super.select()
            .where(e => e.title == $, `%${title}%`)
            .execute()
            .then(e => e ? e.map(e => AliveLink.fromDatabase(e)) : []);
    }

    /**
     * @param {AliveLink} link
     * @returns {Promise<void>}
     */
    async remove(link) {
        const results = await super.delete()
            .where(e => e.id === $ && e.type === $, link.id, link.type)
            .execute();
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<AliveLink>}
     */
    async getByIdAndType(id, type) {
        return await super.select().where(e => e.id === $ && e.type === $, id, type)
            .execute()
            .then(e => e ? AliveLink.fromDatabase(e[0]) : undefined)
    }

}

