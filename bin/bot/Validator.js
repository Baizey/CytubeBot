const quality = require("../core/VideoQuality");
const logger = require("../core/Logger");
const utils = require("../core/Utils");
const Time = require("../core/Time");
const Api = require("../core/Api");
const Video = require("../structure/Playlist").Video;
const Playlist = require("../structure/Playlist");

/**
 * @param {Validator} validator
 */
const checkQueue = async function (validator) {
    if (!validator.isPaused)
        validator.checkQueue();
    setTimeout(() => checkQueue(validator), Time.fromMillis(2000, 4000).millis);
};

/**
 * @param {Validator} validator
 */
const getOldLinks = async function (validator) {
    if (!validator.isPaused)
        validator.addOldLinksToQueue();
    setTimeout(() => getOldLinks(validator), Time.fromHours(2, 30).millis);
};

class Validator {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.queue = [];
        this.bot = bot;
        this.isPaused = true;
        checkQueue(this).finally();
        getOldLinks(this).finally();
    }

    pause() {
        this.isPaused = true;
    }

    unpause() {
        this.isPaused = false;
    }

    checkQueue() {
        const self = this;
        if (this.queue.length === 0) return;
        const item = this.queue.shift();
        const video = item.video;

        logger.system(`Validating: ${video.fullTitle}`);

        // Not worth validating intermissions
        if(Playlist.intermissionLimit.isBiggerThan(video.time))
            return;

        // Not worth re-validating dead links
        if (this.bot.db.isDead(video))
            return;

        // We must have queued this link for validation more than once... whoops
        const vali = this.bot.db.prepareSelect(this.bot.db.structure.videos.table.name, this.bot.db.structure.videos.table.keysWhere()).get(video.id, video.type);
        if (utils.defined(vali))
            if (Time.current().isBiggerThan(Time.fromSeconds(vali.validateBy)))
                return;

        Api.validateVideo(this.bot, video).then(resp => {
            const vidstring = `${video.title} (${video.url})`;

            if (resp.retry) {
                logger.error(`Retry: ${vidstring}`);
                this.queue.push(item);
            } else if (resp.avail) {
                logger.system(`Valid: ${vidstring}`);
                self.bot.db.moveToAlive(video);
            } else {
                logger.system(`Dead : ${vidstring}`);
                self.bot.db.moveToDead(video);
            }

            if(utils.defined(item.after) && typeof item.after === "function")
                item.after(resp);
        });
    }

    addOldLinksToQueue() {
        const videos = this.bot.db.getVideosNeedingValidation();
        videos.forEach(video => this.add(video, null));
    }

    /**
     * @param {Video} video
     * @param {Function} after
     */
    add(video, after = () => {}) {
        if(video.isIntermission())
            return;
        this.queue.push(new Item(video, after));
    }

}

class Item {
    /**
     * @param {Video} video
     * @param {Function} after
     */
    constructor(video, after) {
        this.after = after;
        this.video = video;
    }
}

module.exports = Validator;