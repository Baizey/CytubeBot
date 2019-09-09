import Logger from '../infrastructure/logger/Logger.js';
import ServiceClient from "./ServiceClient.js";

export default class TmdbAgent {

    constructor(apiKey) {
        this._client = new ServiceClient('https://api.themoviedb.org/3/', {
            api_key: apiKey,
            language: 'en-US'
        });
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{
     *     popularity: number,
     *     vote_count: number,
     *     vote_average: number
     *     video: boolean,
     *     id: number,
     *     adult: boolean,
     *     original_title: string,
     *     title: string,
     *     overview: string|null,
     *     release_date: string
     * }[]>}
     */
    async search(title, year = 0) {
        const params = {
            query: title,
            year: year
        };
        const response = await this._client.get('search/movie', params);

        if (!response.success) {
            Logger.error(response);
            return [];
        }

        return response.data.results;
    }

    /**
     * @param {number} id
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
     *     tagline: string|null
     * }>}
     */
    async getById(id) {
        const response = await this._client.get(`movie/${id}`);
        if (!response.success) {
            Logger.error(response);
            return undefined;
        }
        return response.data;
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
     *     tagline: string|null
     * }>}
     */
    async getByTitle(title, year = 0) {
        const searchResponse = await this.search(title, year);
        if (searchResponse.length === 0)
            return undefined;
        const id = searchResponse[0].id;
        return await this.getById(id);
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    /*
    async getCredits(id) {
        throw 'Not implemented';
        const response = await super._get(`movie/${id}/credits`);
    }
     */

}