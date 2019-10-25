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
    async _search(title, year = 0) {
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
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{}>}
     */
    async getRecommended(title, year = 0) {
        const searchResponse = await this._search(title, year);
        if (searchResponse.length === 0)
            return undefined;
        const id = searchResponse[0].id;

        const recommended = await this._client.get(`movie/${id}/recommendations`);

        if (!recommended.success) {
            Logger.error(recommended);
            return undefined;
        }

        return recommended.data;
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<{}>}
     */
    async getSimilar(title, year = 0) {
        const searchResponse = await this._search(title, year);
        if (searchResponse.length === 0)
            return undefined;
        const id = searchResponse[0].id;

        const similar = await this._client.get(`movie/${id}/similar`);

        if (!similar.success) {
            Logger.error(similar);
            return undefined;
        }

        return similar.data;
    }

    /**
     * @param id
     * @returns {Promise<{success: boolean, statusCode: number,
     * data: {
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
     * }
     * }>}
     * @private
     */
    async _getInfo(id) {
        return await this._client.get(`movie/${id}`);
    }

    /**
     * @param id
     * @returns {Promise<{success: boolean, statusCode: number,
     * data: {cast: {name: string}[]}
     * }>}
     * @private
     */
    async _getCredits(id) {
        return await this._client.get(`movie/${id}/credits`);
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
        const search = await this._search(title, year);
        if (search.length === 0)
            return undefined;
        const id = search[0].id;

        const [info, credits] = await Promise.all([this._getInfo(id), this._getCredits(id)]);

        if (!info.success) {
            Logger.error(info);
            return undefined;
        }

        if (!credits.success) {
            Logger.error(credits);
            return undefined;
        }

        info.data.credits = credits.data;
        return info.data;
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