import ServiceClient from "./ServiceClient";

export default class GiphyAgent {

    constructor(apiKey) {
        this._client = new ServiceClient('https://api.giphy.com/v1', {
            api_key: apiKey
        });
    }

    /**
     * @param {string} query
     * @param {int} limit
     * @param {string} rating
     * @returns {Promise<string[]>}
     */
    async search(query, limit = 5, rating = 'r') {
        const result = await this._client.get('gifs/search', {
            q: query,
            limit: limit,
            rating: rating
        });
        return result.success
            ? result.data.data.map(e => `https://media.giphy.com/media/${e.id}/giphy.${e.type}`)
            : [];
    }

}