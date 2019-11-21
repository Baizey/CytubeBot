import Logger from '../infrastructure/logger/Logger.js';
import ServiceClient from "./ServiceClient.js";

export default class UrbanDictionaryAgent {

    constructor() {
        this._client = new ServiceClient('https://api.urbandictionary.com');
    }

    /**
     * @param {string} query
     * @returns {Promise<UrbanDefinition>}
     */
    async define(query) {
        const params = {term: query, page: 0};
        const response = await this._client.get('v0/define', params);

        if (!response.success) {
            Logger.error(response);
            return undefined;
        }

        const result = response.data && response.data.list && response.data.list[0];
        if (!result) return undefined;
        return new UrbanDefinition(result);
    }

    /**
     * @returns {Promise<UrbanDefinition>}
     */
    async random() {
        const params = {page: 0};
        const response = await this._client.get('v0/random', params);

        if (!response.success) {
            Logger.error(response);
            return undefined;
        }

        const result = response.data && response.data.list && response.data.list[0];
        if (!result) return undefined;
        return new UrbanDefinition(result);
    }
}

class UrbanDefinition {
    constructor(data) {
        this.definition = data.definition && data.definition.htmlDecode().replace(/[\[\]]/g, '');
        this.example = data.example && data.example.htmlDecode().replace(/[\[\]]/g, '');
    }
}