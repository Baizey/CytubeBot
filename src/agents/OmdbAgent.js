import Logger from '../infrastructure/logger/Logger.js';
import ServiceClient from "./ServiceClient.js";

export default class OmdbAgent {

    /**
     * @param {string} apiKey
     */
    constructor(apiKey) {
        this._client = new ServiceClient(`https://www.omdbapi.com`, {
            apikey: apiKey,
            r: 'json',
            type: 'movie',
            plot: 'short',
            v: 1,
        });
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
        const response = await this._client.get({i: id});
        if (!response.success) {
            Logger.error(response);
            return undefined;
        }
        const data = response.data;
        return data.Error ? undefined : data;
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
        const response = await this._client.get({t: title, y: year});
        if (!response.success) {
            Logger.error(response);
            return undefined;
        }
        const data = response.data;
        return data.Error ? undefined : data;
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
        const params = {s: title, y: year};
        // Returns {Response: string, Search: [movies], totalResults: number}
        const response = await this._client.get(params);
        if (!response.success) {
            Logger.error(response);
            return [];
        }
        const data = response.data;
        return data.Error ? [] : data.Search;
    }
}