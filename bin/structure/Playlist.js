const Time = require("../core/Time");
const utils = require("../core/Utils");
const VideoUtils = require("../core/VideoUtils");

const intermissionTime = Time.ofMinutes(15);

/**
 * @param {String} url
 * @returns {{id: null, type: null}}
 */
function splitLink(url) {
    const result = {id: null, type: null};
    const site = url.split("/")[0].replace(/^(https?:\/\/)?(www\.)?/, "");
    switch (site) {
        case 'docs.google.com':
        case 'drive.google.com':
            result.type = "gd";
            result.id = url.split("file/d/", 2)[1].split("/", 1)[0];
            break;
        case 'searchYoutube.com':
            result.type = "yt";
            result.id = url.split("watch?v=", 2)[1];
            break;
        case 'vimeo.com':
            result.type = "vi";
            result.id = url.split("vimeo.com/", 2)[1];
            break;
        case 'dailymotion.com':
            result.type = "dm";
            result.id = url.split("/video/", 2)[1];
            break;
    }
    return result;
}

/**
 * @param {String} id
 * @param {String} type
 * @returns {string}
 */
function uniteLink(id, type) {
    switch (type) {
        case "gd":
            return `docs.google.com/file/d/${id}/edit`;
        case "yt":
            return `youtube.com/watch?v=${id}`;
        case "vi":
            return `vimeo.com/${id}`;
        case "dm":
            return `dailymotion.com/video/${id}`;
        default:
            return "";
    }
}

class Video {

    static empty() {
        return new Video();
    }

    static fromIdAndType(id, type) {
        const video = Video.empty();
        video.setFromIdAndType(id, type);
        return video;
    }

    /**
     * @param {CytubeBot} bot
     * @param {String} fullTitle
     * @returns {Video}
     */
    static fromTitle(bot, fullTitle) {
        fullTitle = fullTitle.trim();

        if (utils.isEmpty(fullTitle))
            fullTitle = "$curr";

        switch (fullTitle) {
            case "$prev":
                return bot.playlist.getVideoFromCurrent(-1);
            case "$curr":
                return bot.playlist.getVideoFromCurrent(0);
            case "$next":
                return bot.playlist.getVideoFromCurrent(1);
            default:
                const video = Video.empty();
                video.setFullTitle(fullTitle);
                return video;
        }
    }

    /**
     * @param {String} url
     * @returns {Video}
     */
    static fromUrl(url) {
        const video = Video.empty();
        video.setUrl(url);
        return video;
    }

    /**
     * @param {Object} databaseVideo
     * @returns {Video}
     */
    static fromDatabase(databaseVideo) {
        const video = Video.empty();
        video.fullTitle = databaseVideo.fulltitle;
        video.title = databaseVideo.title;
        video.year = databaseVideo.year;
        video.quality = databaseVideo.quality;
        video.time = Time.ofSeconds(databaseVideo.duration);
        video.setFromIdAndType(databaseVideo.id, databaseVideo.type);
        video.validateBy = Time.of(databaseVideo.validateBy);
        return video;
    }

    /**
     * @param {Object} cytubeVideo
     * @returns {Video}
     */
    static fromCytube(cytubeVideo) {
        const video = Video.empty();

        video.temp = cytubeVideo.temp;
        video.queuedBy = cytubeVideo.queuedBy;
        video.uid = cytubeVideo.uid;

        const media = utils.defined(cytubeVideo.media) ? cytubeVideo.media : cytubeVideo;

        video.setFullTitle(media.title);
        video.time = Time.ofSeconds(media.seconds);
        video.setFromIdAndType(media.id, media.type);

        return video;
    }

    constructor() {
        this.temp = true;
        this.uid = null;
        this.queuedBy = null;
        this.time = Time.ofSeconds(1).add(intermissionTime);

        this.validateBy = Time.of();

        this.title = null;
        this.releaseYear = 0;
        this.year = 0;
        this.quality = "";

        this.fullTitle = null;
        this.url = null;
        this.type = null;
        this.id = null;
    }

    /**
     * @param {String} id
     * @param {String} type
     */
    setFromIdAndType(id, type) {
        this.id = id;
        this.type = type;
        this.url = uniteLink(id, type);
    }

    /**
     * @param {String} url
     */
    setUrl(url) {
        this.url = url;

        const res = splitLink(url);
        this.id = res.id;
        this.type = res.type;
    }

    isIntermission() {
        return intermissionTime.isBigger(this.time);
    }

    /**
     * @param {String} fullTitle
     */
    setFullTitle(fullTitle) {
        this.fullTitle = fullTitle;

        const filtered = VideoUtils.filterTitle(fullTitle);
        this.title = filtered.title;
        this.quality = filtered.quality;
        this.year = Math.round(filtered.releaseYear);
    }

    asQueueObject() {
        return {
            temp: this.isIntermission(),
            pos: "next",
            id: this.id,
            type: this.type
        };
    }

    /**
     * @returns {number}
     */
    get queryYear() {
        // No title to know year from
        if (!utils.defined(this.fullTitle))
            return 0;

        if (/year:\d{4}/.test(this.fullTitle))
            return Math.round(/year:(\d{4})/.exec(this.fullTitle)[1] - 0);

        return 0;
    }

    /**
     * @param {String} parameterName
     * @returns {String}
     */
    urlQueryYear(parameterName = 'year') {
        const y = this.queryYear;
        return y === 0 ? '' : `&${parameterName}=${y}`;
    }

    get simpleTitle() {
        return this.title.replace(/[;:,.']/g, '').replace(/ ?& ?/g, ' and ').trim();
    }

    get displayTitle() {
        if (utils.isEmpty(this.title))
            return "";
        return this.title.charAt(0).toUpperCase() + this.title.slice(1);
    }

    /**
     * @param {CytubeBot} bot
     * @returns {Boolean}
     */
    inDatabase(bot) {
        if (bot.db.isDead(this))
            return false;
        return utils.defined(bot.db.getVideoExact(this));
    }
}

module.exports = {
    Video: Video,
    intermissionLimit: intermissionTime,
    splitUrl: splitLink,
    uniteUrl: uniteLink,
};