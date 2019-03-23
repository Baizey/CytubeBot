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
        validator.addOldLinksToQueue().finally();
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
        const bot = this.bot;
        const db = bot.db;
        if (this.queue.length === 0) return;
        const item = this.queue.shift();
        const video = item.video;

        logger.system(`Validating: ${video.fullTitle}`);

        // Not worth validating intermissions
        if (Playlist.intermissionLimit.isBiggerThan(video.time))
            return;

        db.hasDeadVideo(video).then(async hasDeadVideo => {
            if (hasDeadVideo) return;

            const needValidation = await db.isVideoNeedingValidation(video.id, video.type);

            if (!needValidation)
                return;

            const resp = await Api.validateVideo(bot, video);
            const logString = `${video.title} (${video.url})`;

            if (resp.retry) {
                logger.error(`Retry: ${logString}`);
                self.add(item.video, item.after);
            } else if (resp.avail) {
                logger.system(`Valid: ${logString}`);
                db.moveVideoToAlive(video).finally();
            } else {
                logger.system(`Dead : ${logString}`);
                db.moveVideoToDead(video).finally();
            }

            if (utils.isDefined(item.after) && typeof item.after === "function")
                item.after(resp);
        });
    }

    async addOldLinksToQueue() {
        const self = this;
        const videos = await this.bot.db.getVideosNeedingValidation();
        videos.forEach(video => self.add(video, null));
    }

    /**
     * @param {Video} video
     * @param {Function} after
     */
    add(video, after = () => {
    }) {
        if (video.isIntermission)
            return;
        const self = this;
        this.bot.db.isVideoNeedingValidation(video.id, video.type)
            .then(needValidation => {
                if (needValidation)
                    self.queue.push(new Item(video, after));
            });
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