import Bot from "../../src/Bot/Bot";
import CytubeServiceMock from "./CytubeServiceMock";
import DbContextMock from "./DbContextMock";
import DatabaseMock from "./DatabaseMock";
import {
    CleverbotAgentMock,
    GiphyAgentMock, OmdbAgentMock,
    PastebinAgentMock, TmdbAgentMock,
    UrbanDictionaryAgentMock,
    YoutubeAgentMock
} from "./Apis";

export default class MockConstructor {

    /**
     * @returns {{apis: {
            pastebin: PastebinAgentMock,
            urbanDictionary: UrbanDictionaryAgentMock,
            chatbot: CleverbotAgentMock,
            tmdb: TmdbAgentMock,
            omdb: OmdbAgentMock,
            youtube: YoutubeAgentMock,
            giphy: GiphyAgentMock
     * },
     * dbContext: DbContextMock,
     * database: DatabaseMock,
     * cytubeService: CytubeServiceMock,
     * bot: Bot}}
     */
    static get mock() {
        const params = {};
        params.dbContext = new DbContextMock();
        params.database = new DatabaseMock(params.dbContext);
        params.cytubeService = new CytubeServiceMock();
        params.apis = {
            pastebin: new PastebinAgentMock(),
            urbanDictionary: new UrbanDictionaryAgentMock(),
            chatbot: new CleverbotAgentMock(),
            tmdb: new TmdbAgentMock(),
            omdb: new OmdbAgentMock(),
            youtube: new YoutubeAgentMock(),
            giphy: new GiphyAgentMock()
        };
        params.bot = new Bot('bot', params.apis, params.cytubeService, params.database);
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