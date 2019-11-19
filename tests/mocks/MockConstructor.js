import Bot from "../../src/Bot/Bot";
import ApiKeys from "../../src/infrastructure/config/ApiKeys";
import CytubeServiceMock from "./CytubeServiceMock";
import DbContextMock from "./DbContextMock";
import DatabaseMock from "./DatabaseMock";

export default class MockConstructor {

    /**
     * @returns {{dbContext: DbContextMock, database: DatabaseMock, cytubeService: CytubeServiceMock, bot: Bot}}
     */
    static get mock() {
        const params = {};
        params.dbContext = new DbContextMock();
        params.database = new DatabaseMock(params.dbContext);
        params.cytubeService = new CytubeServiceMock();
        params.bot = new Bot('bot',  new ApiKeys(), params.cytubeService, params.database);
        return params;
    }

    /**
     * @returns {DatabaseMock}
     * @param {DbContextMock} context
     */
    static database(context = new DbContextMock()) {
        return new DatabaseMock(context);
    }
}