import BaseDatabaseAgent from "./BaseDatabaseAgent.js";

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
        create.int('validateBy').default(0);
        super(context, create);
    }
}

