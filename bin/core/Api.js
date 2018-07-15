const request = require('snekfetch');
const logger = require('./Logger');
const utils = require("./Utils");
const Response = require("../structure/Api").Response;
const Available = require("../structure/Api").Available;
const Video = require("../structure/Playlist").Video;

class Api {
    /**
     * @param {String} url
     * @param {Boolean} isJson
     * @returns {Promise<Response>}
     */
    static async request(url, isJson = true) {
        if (!/^https?:\/\//.test(url))
            url = 'https://' + url;
        logger.system(`Sending url (${url})`);
        return request.get(url)
            .then(result => {
                if (isJson)
                    return new Response(true, JSON.parse(result.text));
                return new Response(true, result.text);
            })
            .catch(error => {
                if (isJson)
                    return new Response(true, JSON.parse(error.text));
                return new Response(false, error.text);
            }).catch(error => {
                logger.error(`URL error: ${error}`);
                return new Response(false, error)
            });
    }

    /**
     * @param {CytubeBot} bot
     * @param {String[]} queries
     * @param {String} prefix
     * @returns {Promise<Response[]>}
     */
    static async searchYoutube(bot, queries, prefix = "") {
        const results = [];

        for(let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const url = `www.googleapis.com/youtube/v3/search?part=snippet&key=${bot.apikeys.google}&q=${prefix} ${query}&maxResults=1`;
            results.push(await (Api.request(url)
                .then(resp => new Response(true, Video.fromIdAndType(resp.result.items[0]["id"]["videoId"], 'yt')))
                .catch(() => new Response(false, query))));
        }

        return results;
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     */
    static validateVideo(bot, video) {
        switch (video.type) {
            case 'gd':
                return Api._validateGoogledrive(bot, video);
            case 'yt':
                return Api._validateYoutube(bot, video);
            case 'vi':
                return Api._validateVimeo(bot, video);
            case 'dm':
                return Api._validateDailymotion(bot, video);
            // Just pretend anything unknown is working... this is fiiiiine
            default:
                return Api.request("")
                    .then(resp => new Available(resp.success, resp.result, video));
        }
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     * @private
     */
    static _validateVimeo(bot, video) {
        const lackTitle = !utils.defined(video.title);
        const url = `vimeo.com/api/oembed.json?vimeo.com/${video.id}`;
        return Api.request(url).then(resp => {
            const success = resp.success;
            const result = resp.result;
            resp = new Available(success, result, video);

            if (success && lackTitle)
                video.setFullTitle(result.title);

            resp.avail = success
                && utils.defined(result.type)
                && utils.defined(result.video_id)
                && utils.defined(result.uri);
            return resp;
        });
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     * @private
     */
    static _validateDailymotion(bot, video) {
        const lackTitle = !utils.defined(video.fullTitle);
        const url = `api.dailymotion.com/video/${video.id}`;
        return Api.request(url).then(resp => {
            const success = resp.success;
            const result = resp.result;
            resp = new Available(success, result, video);

            if (success && lackTitle)
                video.setFullTitle(result.title);

            resp.avail = success && !utils.defined(result.error);
            return resp;
        });
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     * @private
     */
    static _validateYoutube(bot, video) {
        const lackTitle = !utils.defined(video.fullTitle);
        let url = `www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${video.id}&key=${bot.apikeys.google}`;

        return Api.request(url).then(resp => {
            const success = resp.success;
            const result = resp.result;
            const response = new Available(success, result, video);

            if (!success) {
                response.retry = true;
                return response;
            }

            if (utils.isEmpty(result.items)) {
                response.avail = false;
                return response;
            }

            let res = result.items[0];
            if (lackTitle)
                video.setFullTitle(res.snippet.title);
            res = res.status;

            response.avail = res.uploadStatus !== "rejected"
                && res.embeddable
                && res.privacyStatus === "public";

            return response;
        });
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     * @private
     */
    static _validateGoogledrive(bot, video) {
        const lackTitle = !utils.defined(video.fullTitle);
        let url = "www.googleapis.com/drive/v3/files/" + video.id + "?key=" + bot.apikeys.google + "&fields=webViewLink" + (lackTitle ? ",name" : "");
        return Api.request(url).then(resp => {
            const success = resp.success;
            const result = resp.result;

            const response = new Available(success, result, video);

            if (!success) {
                response.retry = true;
                return response;
            }

            if (lackTitle)
                video.setFullTitle(result.name);

            if (!utils.defined(result.error)) {
                response.avail = utils.defined(result.webViewLink);
                return response;
            }

            logger.error("Failed validation with error: " + result.error.message);
            switch (result.error.code) {
                // Handle errors caused by too much api usage
                case 403:
                    response.avail = !(result.error.message.toLowerCase().indexOf("rate limit") >= 0);
                    response.retry = resp.avail;
                    break;
                case 429:
                    response.retry = true;
                    break;
                default:
                    response.avail = false;
            }

            return response;
        });
    }

}

module.exports = Api;