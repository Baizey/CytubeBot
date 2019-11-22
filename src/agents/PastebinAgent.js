import ServiceClient from "./ServiceClient";

export default class GiphyAgent {

    constructor(apiKey) {
        this._client = new ServiceClient('https://pastebin.com/api/', {
            api_dev_key: apiKey,
            api_option: 'paste',
            api_paste_private: 1,
            api_paste_expire_date: '1D'
        });
    }

    /**
     * @param {string} text
     * @returns {Promise<string[]>}
     */
    async paste(text) {
        const result = await this._client.post('api_post.php', {
            api_paste_code: text
        });
        return result.success ? result.data : undefined;
    }

}