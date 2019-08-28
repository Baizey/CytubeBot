import BaseDatabaseAgent from "./BaseDatabaseAgent.js";

export default class AliveLinksDatabaseAgent extends BaseDatabaseAgent {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        super(context, 'videos');
    }
}

