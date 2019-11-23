import YoutubeAgent from "../../src/agents/YoutubeAgent";
import CleverbotAgent from "../../src/agents/CleverbotAgent";
import GiphyAgent from "../../src/agents/GiphyAgent";
import PastebinAgent from "../../src/agents/PastebinAgent";
import UrbanDictionaryAgent, {UrbanDefinition} from "../../src/agents/UrbanDictionaryAgent";
import TmdbAgent from "../../src/agents/TmdbAgent";
import OmdbAgent from "../../src/agents/OmdbAgent";

export class YoutubeAgentMock extends YoutubeAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} query
     * @returns {Promise<PlaylistVideo>}
     */
    async search(query) {
    }
}

export class CleverbotAgentMock extends CleverbotAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} message
     * @returns {Promise<string>}
     */
    async chat(message) {
        return '';
    }
}

export class GiphyAgentMock extends GiphyAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} query
     * @param {int} limit
     * @param {string} rating
     * @returns {Promise<string[]>}
     */
    async search(query, limit, rating) {
        return [];
    }
}

export class UrbanDictionaryAgentMock extends UrbanDictionaryAgent {
    /**
     * @param {string} query
     * @returns {Promise<UrbanDefinition>}
     */
    async define(query) {
        return new UrbanDefinition({definition: '', example: ''});
    }
}

export class PastebinAgentMock extends PastebinAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} text
     * @returns {Promise<string>}
     */
    async paste(text) {
        return undefined;
    }
}

export class OmdbAgentMock extends OmdbAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} id
     * @returns {Promise<{
     *     Title: string,
     *     Year: number,
     *     Genre: string,
     *     Director: string,
     *     Plot: string,
     *     Type: string,
     *     Metascore: string
     *     Ratings: [{Source: string, Value: string}]
     * }>}
     */
    async getByIMDb(id) {
        return undefined;
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{
     *     Title: string,
     *     Year: number,
     *     Genre: string,
     *     Director: string,
     *     Plot: string,
     *     Type: string,
     *     Metascore: string
     *     Ratings: [{Source: string, Value: string}]
     * }>}
     */
    async getByTitle(title, year = 0) {
        return undefined;
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<[{
     *     Title: string,
     *     Year: number,
     *     Type: string,
     *     imdbID: string
     * }]>}
     */
    async search(title, year = 0) {
        return [];
    }
}

export class TmdbAgentMock extends TmdbAgent {
    constructor() {
        super(undefined);
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{}>}
     */
    async getRecommended(title, year = 0) {

    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{}>}
     */
    async getSimilar(title, year = 0) {

    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{
     *     imdb_id: string|null,
     *     release_date: string,
     *     overview: string,
     *     overview: string|null,
     *     original_title: string,
     *     genres: {id:number, name:string}[],
     *     budget: number,
     *     adult: boolean,
     *     revenue: number,
     *     title: string,
     *     vote_count: number,
     *     vote_average: number,
     *     tagline: string|null,
     *     credits: {cast: {name: string}[]}
     * }>}
     */
    async getInfo(title, year = 0) {

    }
}