import * as nodeFetch from 'node-fetch';
import '../infrastructure/prototype/object.js';
import '../infrastructure/prototype/string.js';
import Logger from '../infrastructure/logger/Logger.js';

const fetch = nodeFetch.default;

export default class ServiceClient {

    /**
     * @param {string} baseUrl
     * @param {object} params
     * @param {function(*):*} handler
     */
    constructor(baseUrl, params, handler = e => e) {
        this.baseUrl = baseUrl;
        this._baseParams = params;
    }

    /**
     * @param {string} path
     * @param {object} urlParams
     * @returns {Promise<{success: boolean, statusCode: number, data: *}>}
     */
    get(path = '', urlParams = {}) {
        const params = ({...urlParams, ...this._baseParams})
            .keyValuePairs()
            .filter(e => e.value)
            .map(pair => `${pair.key}=${pair.value}`)
            .join('&');
        const url = `${this.baseUrl}${path}?${params}`;
        return fetch(url)
            .then(resp => ({
                success: resp.ok,
                statusCode: resp.status,
                data: resp.json()
            }))
            .catch(error => {
                Logger.error(error);
                throw error;
            })
    }

    /**
     * @param {string} path
     * @param {object} urlParams
     * @returns {Promise<{success: boolean, statusCode: number, data: *}>}
     */
    post(path = '', urlParams = {}) {
        const params = ({...urlParams, ...this._baseParams})
            .keyValuePairs()
            .filter(e => e.value)
            .toObject(e => e.key, e => e.value);
        const url = `${this.baseUrl}${path}`;
        return fetch(url, {
            method: 'POST',
            body: params
        })
            .then(resp => ({
                success: resp.ok,
                statusCode: resp.status,
                data: resp.json()
            }))
            .catch(error => {
                Logger.error(error);
                throw error;
            })
    }

}