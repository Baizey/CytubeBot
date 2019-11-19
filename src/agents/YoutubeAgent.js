import Logger from '../infrastructure/logger/Logger.js';
import ServiceClient from "./ServiceClient.js";
import PlaylistVideo from "../Services/models/PlaylistVideo";

export default class YoutubeAgent {

    constructor(apiKey) {
        this._client = new ServiceClient('https://www.googleapis.com/youtube/v3/search', {
            key: apiKey,
            maxResults: 1,
            part: 'snippet'
        });
    }

    /**
     * @param {string} query
     * @returns {Promise<PlaylistVideo>}
     */
    async search(query) {
        const params = {q: query, type: 'video'};
        const response = await this._client.get(params);

        if (!response.success) {
            Logger.error(response);
            return undefined;
        }

        const result = response.data.items[0];
        if (!result) return undefined;
        return new PlaylistVideo(result.id.videoId, 'yt', result.snippet.title.htmlDecode());
    }

}