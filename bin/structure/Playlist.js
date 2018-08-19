const Time = require("../core/Time");
const utils = require("../core/Utils");
const VideoUtils = require("../core/VideoUtils");

const intermissionTime = Time.fromMinutes(15);

function removeLinkId(text) {
    return text
        .replace(/(docs\.google\.com\/file\/d\/)([\w-]+)/gi, (g0, g1) => `${g1}<hidden>`)
        .replace(/(youtube\.com\/watch\?v=)([\w-]+)/gi, (g0, g1) => `${g1}<hidden>`)
        .replace(/(vimeo\.com\/)([\w-]+)/gi, (g0, g1) => `${g1}<hidden>`)
        .replace(/(dailymotion\.com\/video\/)([\w-]+)/gi, (g0, g1) => `${g1}<hidden>`);
}

/**
 * @param {String} url
 * @returns {{type: string|null, id: string|null}}
 */
function splitLink(url) {
    if (utils.isUndefined(url))
        return {id: null, type: null};

    const host = url.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();

    switch (host) {
        case 'docs.google.com':
        case 'drive.google.com':
            return {type: 'gd', id: url.split('file/d/', 2)[1].split(/[\/?#]/, 1)[0]};
        case 'searchyoutube.com':
        case 'youtube.com':
            return {type: 'yt', id: url.split('watch?v=', 2)[1].split('?')[0]};
        case 'vimeo.com':
            return {type: 'vi', id: url.split('vimeo.com/', 2)[1].split(/[?#]/)[0]};
        case 'dailymotion.com':
            return {type: 'dm', id: url.split('/video/', 2)[1].split(/[?#]/)[0]};
    }

    return {id: null, type: null};
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
            return '';
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
     * @param {Message} message
     * @returns {Video}
     */
    static fromMessage(bot, message) {
        let title = message.msg.trim();

        if (utils.isEmpty(title))
            message.setTag('curr');

        if (message.hasTag('curr'))
            return bot.playlist.getVideoFromCurrent(0);
        if (message.hasTag('next'))
            return bot.playlist.getVideoFromCurrent(1);
        if (message.hasTag('prev'))
            return bot.playlist.getVideoFromCurrent(-1);

        const video = Video.empty();
        video.title = title;
        video.year = message.hasTag('year')
            ? (isNaN(message.getTag('year') - 0) ? 0 : message.getTag('year') - 0)
            : 0;
        video.fullTitle = `${video.title}${video.year > 0 ? ` [year:${video.year}]` : ''}`;
        return video;
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
        video.time = Time.fromSeconds(databaseVideo.duration);
        video.setFromIdAndType(databaseVideo.id, databaseVideo.type);
        video.validateBy = Time.from(databaseVideo.validateBy);
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

        const media = utils.isDefined(cytubeVideo.media) ? cytubeVideo.media : cytubeVideo;

        video.setFullTitle(media.title);
        video.time = Time.fromSeconds(media.seconds);
        video.setFromIdAndType(media.id, media.type);

        return video;
    }

    constructor() {
        this.temp = true;
        this.uid = null;
        this.queuedBy = null;
        this.time = Time.from();

        this.validateBy = Time.from();

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

    asKey(){
        return `${this.type}|${this.id}`;
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

    get isMovie (){
        return !this.isIntermission;
    }

    get isIntermission() {
        return intermissionTime.isBiggerThan(this.time);
    }

    /**
     * @param {String} fullTitle
     * @param {Boolean} ignoreReleaseYear
     */
    setFullTitle(fullTitle, ignoreReleaseYear = false) {
        this.fullTitle = fullTitle;

        const filtered = VideoUtils.filterTitle(fullTitle);
        this.title = ignoreReleaseYear ? filtered.titleWithReleaseYear : filtered.title;
        this.quality = filtered.quality;

        this.year = ignoreReleaseYear ? 0 : Math.round(filtered.releaseYear);
    }


    asQueueObject() {
        return {
            temp: this.isIntermission,
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
        if (utils.isUndefined(this.fullTitle))
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
        return utils.isDefined(bot.db.getVideoExact(this));
    }
}

module.exports = {
    Video: Video,
    intermissionLimit: intermissionTime,
    splitUrl: splitLink,
    uniteUrl: uniteLink,
    removeUrlId: removeLinkId
};