import ServiceClient from "./ServiceClient.js";

export default class CleverbotAgent {

    /**
     * @param {string} apiKey
     */
    constructor(apiKey) {
        this._client = new ServiceClient(`https://www.cleverbot.com/getreply`, {
            key: apiKey
        });
        this._cs = null;
    }

    /**
     * @param {string} message
     * @returns {Promise<string>}
     */
    async chat(message) {
        const result = await this._client.get({
            input: message,
            cs: this._cs
        });

        if (!result.success)
            return 'Shit went wrong, chat with me later.';

        this._cs = result.data.cs;
        return result.data.output;
    }
}
