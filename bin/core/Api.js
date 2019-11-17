const fetch = require('node-fetch').default;
const logger = require('./Logger');
const utils = require("./Utils");
const Response = require("../structure/Api").Response;
const Available = require("../structure/Api").Available;
const Url = require('url');
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

        return fetch(url)
            .then(r => r.text())
            .then(result => {
                if (isJson)
                    return new Response(true, JSON.parse(result));
                return new Response(true, result);
            }).catch(error => {
                try {
                    const result = new Response(true, JSON.parse(error));
                    if (utils.isUsed(result.error) || utils.isUsed(result.errors))
                        result.success = false;
                    if (result.isFailure)
                        logger.error(`Request error: ${result.result}`);
                    return result;
                } catch (ignored) {
                    logger.error(`Request error: ${error}`);
                    return new Response(false, error);
                }
            });
    }

    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     * @param {Video} video
     * @param {String|String[]} requests
     * @returns {Promise<Response|Response[]>}
     */
    static async searchTheMovieDatabase(bot, message, video, requests = null) {
        const errorMsg = `No movies found for '${video.displayTitle}'  ${video.queryYear > 0 ? `(${video.queryYear})` : ""}`;

        const firstUrl = `api.themoviedb.org/3/search/movie?api_key=${bot.apikeys.themovieDB}&query=${video.title}${video.urlQueryYear()}`;
        let findings = await Api.request(firstUrl).then(async resp => {
            resp.isSuccess &= utils.isUsed(resp.result.results);
            if (resp.isFailure)
                bot.sendMsg(errorMsg, message);
            return resp;
        });

        requests = utils.isUndefined(requests) ? [] : (typeof requests === 'string' ? [requests] : requests).map(s => s.length === 0 ? s : '/' + s);

        if (utils.isEmpty(requests) || findings.isFailure)
            return requests.length > 1 ? requests.map(() => findings) : findings;

        findings = findings.result.results[0];
        bot.sendMsg(`Found ${findings.original_title} (${findings.release_date.split("-", 1)[0]})`, message);

        const result = [];
        for(let i = 0; i < requests.length; i++) {
            const secondUrl = `api.themoviedb.org/3/movie/${findings.id}${requests[i]}?api_key=${bot.apikeys.themovieDB}&language=en-US`;
            result.push(await Api.request(secondUrl).then(resp => {
                if (resp.isFailure) {
                    bot.sendMsg(`Could not get information on ${findings.original_title}`, message);
                    logger.error(resp.result);
                }
                return resp;
            }));
        }

        return result.length > 1 ? result : result[0];
    }

    /**
     * @param {CytubeBot} bot
     * @param {String[]} queries
     * @param {String} prefix
     * @returns {Promise<Response[]>}
     */
    static async searchYoutube(bot, queries, prefix = '') {
        const results = [];

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${bot.apikeys.google}&q=${prefix} ${query}&maxResults=1`;
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
                    .then(resp => new Available(resp.isSuccess, resp.result, video));
        }
    }

    /**
     * @param {CytubeBot} bot
     * @param {Video} video
     * @returns {Promise<Available>}
     * @private
     */
    static _validateVimeo(bot, video) {
        const lackTitle = utils.isUndefined(video.title);
        const url = `vimeo.com/api/oembed.json?vimeo.com/${video.id}`;
        return Api.request(url).then(resp => {
            const success = resp.isSuccess;
            const result = resp.result;
            resp = new Available(success, result, video);

            if (success && lackTitle)
                video.setFullTitle(result.title);

            resp.avail = success
                && utils.isDefined(result.type)
                && utils.isDefined(result.video_id)
                && utils.isDefined(result.uri);
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
        const lackTitle = utils.isUndefined(video.fullTitle);
        const url = `api.dailymotion.com/video/${video.id}`;
        return Api.request(url).then(resp => {
            const success = resp.isSuccess;
            const result = resp.result;
            resp = new Available(success, result, video);

            if (success && lackTitle)
                video.setFullTitle(result.title);

            resp.avail = success && utils.isUndefined(result.error);
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
        const lackTitle = utils.isUndefined(video.fullTitle);
        let url = `https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${video.id}&key=${bot.apikeys.google}`;

        return Api.request(url).then(resp => {
            const success = resp.isSuccess;
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
        const lackTitle = utils.isUndefined(video.fullTitle);
        let url = "https://www.googleapis.com/drive/v3/files/" + video.id + "?key=" + bot.apikeys.google + "&fields=webViewLink" + (lackTitle ? ",name" : "");
        return Api.request(url).then(resp => {
            const success = resp.isSuccess;
            const result = resp.result;

            const response = new Available(success, result, video);

            if (!success) {
                response.retry = true;
                return response;
            }

            if (lackTitle)
                video.setFullTitle(result.name);

            if (utils.isUndefined(result.error)) {
                response.avail = utils.isDefined(result.webViewLink);
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