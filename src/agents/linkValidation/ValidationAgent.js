import ServiceClient from "../ServiceClient.js";
import Utils from "../../infrastructure/Utils";
import PlaylistVideo from "../../Services/models/PlaylistVideo";
import Logger from '../../infrastructure/logger/Logger.js';

export default class ValidationAgent {
    /**
     * @param {ApiKeys} apiKeys
     * @param {LibraryService} library
     */
    constructor(apiKeys, library) {
        this._googleDriveClient = new ServiceClient('https://www.googleapis.com/drive/v3/files/', {
            key: apiKeys.google,
            fields: 'webViewLink,name'
        });
        this._youtubeClient = new ServiceClient('https://www.googleapis.com/youtube/v3/videos/', {
            key: apiKeys.google,
            part: 'status,snippet',
        });
        this._vimeoClient = new ServiceClient('https://vimeo.com/api/oembed.json?vimeo.com/', {});
        this._dailymotionClient = new ServiceClient('https://api.dailymotion.com/video/', {});
        this._queue = [];
        this._library = library;
    }

    /**
     * returns elements left to be validated
     * @param {PlaylistVideo[]} queue
     * @returns {Promise<number>}
     */
    async validateLibrary(queue) {
        if (this._queue.length > 0)
            return this._queue.length;

        this._queue = queue;

        new Promise(async resolve => {
            while (this._queue.length > 0) {
                const video = this._queue.pop();
                if (video.isIntermission) {
                    await this._library.removeVideo(video);
                } else {
                    let result;
                    do {
                        result = await this.validate(video);
                        if (result.ratelimit) {
                            await Utils.await(1000 * 60 * 60);
                        } else if (result.retry) {
                        } else if (result.valid) {
                            if (result.title && !video.fulltitle)
                                video.setTitle(result.title);
                            await this._library.addVideo(video);
                        } else
                            await this._library.removeVideo(video);
                    } while (result.retry || result.ratelimit);
                }
                await Utils.await(2000);
            }
            resolve();
        }).catch(error => {
            Logger.error(error);
        }).finally(() => {
            this._queue = [];
        });

        return this._queue.length;
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<{valid: boolean, retry: boolean, ratelimit: boolean|undefined, title: string|undefined}>}
     */
    validate(video) {
        switch (video.link.type) {
            case 'gd':
                return this._validateDrive(video);
            case 'yt':
                return this._validateYoutube(video);
            case 'vi':
                return this._validateVimeo(video);
            case 'dm':
                return this._validateDailyMotion(video);
            default:
                return Promise.resolve({valid: true, retry: false});
        }
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<{valid: boolean, retry: boolean, ratelimit: boolean|undefined, title: string|undefined}>}
     * @private
     */
    async _validateDrive(video) {
        const resp = await this._googleDriveClient.get(video.link.id);
        const data = resp.data;

        if (resp.success && data && !data.error) {
            return {
                valid: !!data.webViewLink,
                retry: false,
                title: data.name
            }
        }

        switch (resp.statusCode) {
            case 403:
                const retry = !(data.error.message.toLowerCase().indexOf("rate limit") >= 0);
                return {
                    retry: retry,
                    valid: retry,
                    ratelimit: retry
                };
            case 429:
                return {
                    retry: true,
                    valid: true
                };
            default:
                return {
                    retry: false,
                    valid: false
                };
        }
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<{valid: boolean, retry: boolean, title: string|undefined}>}
     * @private
     */
    async _validateYoutube(video) {
        const response = await this._youtubeClient.get('', {id: video.link.id});

        if (!response.success)
            return {
                retry: true,
                valid: true
            };

        if (!response.data.items || response.data.items.length === 0)
            return {
                retry: false,
                valid: false
            };

        const item = response.data.items[0];

        const avail = item.status.uploadStatus !== "rejected"
            && item.status.embeddable
            && item.status.privacyStatus === "public";

        return {
            valid: avail,
            retry: false,
            title: avail ? item.snippet.title : undefined
        };
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<{valid: boolean, retry: boolean, title: string|undefined}>}
     * @private
     */
    async _validateVimeo(video) {
        const response = await this._vimeoClient.get(video.link.id);
        const avail = response.success
            && response.data.type
            && response.data.video_id
            && response.data.uri;

        return {
            valid: avail,
            retry: false,
            title: avail ? response.data.title : undefined
        };
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<{valid: boolean, retry: boolean, title: string|undefined}>}
     * @private
     */
    async _validateDailyMotion(video) {
        const response = await this._dailymotionClient.get(video.link.id);
        const avail = response.success && !response.data.error;
        return {
            valid: avail,
            retry: false,
            title: avail ? response.data.title : undefined
        };
    }
}