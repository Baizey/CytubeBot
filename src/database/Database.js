import UserDatabaseAgent from "./agents/UserDatabaseAgent.js";
import NominationDatabaseAgent from "./agents/NominationDatabaseAgent.js";
import PatternDatabaseAgent from "./agents/PatternDatabaseAgent.js";
import AliveLinksDatabaseAgent from "./agents/AliveLinksDatabaseAgent.js";
import DeadLinksDatabaseAgent from "./agents/DeadLinksDatabaseAgent.js";

export default class Database {
    /**
     * @param {DbContext} context
     */
    constructor(context) {
        this.users = new UserDatabaseAgent(context);
        this.nominations = new NominationDatabaseAgent(context);
        this.patterns = new PatternDatabaseAgent(context);
        this.aliveLinks = new AliveLinksDatabaseAgent(context);
        this.deadLinks = new DeadLinksDatabaseAgent(context);
    }
}