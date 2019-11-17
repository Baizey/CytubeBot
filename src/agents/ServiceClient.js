import * as nodeFetch from 'node-fetch';
import '../infrastructure/prototype/object.js';
import '../infrastructure/prototype/string.js';
import Logger from '../infrastructure/logger/Logger.js';

const fetch = nodeFetch.default;

export default class ServiceClient {
    /**
     * @param {string} baseUrl
     * @param {object} params
     */
    constructor(baseUrl, params) {
        this.baseUrl = baseUrl;
        this._baseParams = params;
    }

    /**
     * @param {string} url
     * @param {object} options
     * @returns {Promise}
     * @private
     */
    _fetch(url, options = {}) {
        Logger.debug(url + ' ' + JSON.stringify(options));
        return fetch(url, options);
    }

    /**
     * @param {string} path
     * @param {object|undefined} allParams
     * @returns {string}
     * @private
     */
    _joinUri(path, allParams = undefined) {
        let url = this.baseUrl;
        if (path)
            if (path[0] === '/' && url[url.length - 1] === '/')
                url += path.substring(1);
            else if (url[url.length - 1] === '/' || path[0] === '/')
                url += path;
            else
                url += '/' + path;
        if (allParams) {
            const params = allParams
                .keyValuePairs()
                .filter(e => e.value)
                .map(pair => `${pair.key}=${pair.value}`)
                .join('&');
            if (url[url.length - 1] === '?')
                url += params;
            else
                url += '?' + params;
        }
        return url;
    }

    /**
     * @param {string|object} path
     * @param {object} urlParams
     * @returns {Promise<Response>}
     */
    get(path = '', urlParams = {}) {
        if (typeof path === 'object') {
            urlParams = path;
            path = '';
        }
        Logger.debug(this._baseParams);
        const url = this._joinUri(path, ({...urlParams, ...this._baseParams}));
        return this._fetch(url, {
            method: 'GET'
        })
            .then(Response.map)
            .catch(error => {
                Logger.error(error);
                throw error;
            })
    }

    /**
     * @param {string|object} path
     * @param {object} postParams
     * @returns {Promise<Response>}
     */
    post(path = '', postParams = {}) {
        if (typeof path === 'object') {
            postParams = path;
            path = '';
        }
        const params = ({...postParams, ...this._baseParams}).filter(e => e.value);
        const url = this._joinUri(path);
        return this._fetch(url, {
            method: 'POST',
            body: params
        })
            .then(Response.map)
            .catch(error => {
                Logger.error(error);
                throw error;
            })
    }

}

class Response {

    static async map(resp) {
        const data = await resp.json();
        return new Response(resp.ok, resp.status, data);
    }

    constructor(success, statusCode, data) {
        this.success = success;
        this.statusCode = statusCode;
        this.data = data;
    }
}