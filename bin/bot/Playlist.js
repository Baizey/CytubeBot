const utils = require("../core/Utils");
const Time = require("../core/Time");
const Video = require("../structure/Playlist").Video;
const logger = require("../core/Logger");
const Validator = require("./Validator");
const Emit = require('../structure/Socket').Emit;

class Playlist {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.bot = bot;
        this.isLeader = false;
        this.isPlaying = true;
        this.playtime = Time.from();
        this.playlist = [];
        this.previousUID = null;
        this.currentUID = null;
        this.currentVideo = Video.empty();
    }

    /**
     * @param {Video|String} video
     */
    add(video) {
        if (typeof video === "string")
            video = Video.fromUrl(video);
        this.bot.connection.emit(Emit.playlist.queue, video.asQueueObject());
        logger.system(`Queuing link: ${video.url}`);
    }

    /**
     * @returns {{time: Time, intermissions: Video[], next: Video}}
     */
    get dataTillNextMovie() {
        const result = {
            time: Time.fromMillis(this.currentVideo.time.millis - this.playtime.millis),
            intermissions: [],
            next: Video.empty()
        };

        let at = this.indexFromUid(this.currentUID);
        if (at === -1)
            return result;

        if (this.currentVideo.isIntermission)
            result.intermissions.push(this.currentVideo);

        for (let i = at + 1; i !== at && at < this.playlist.length; i = (i + 1) % this.playlist.length) {
            const curr = this.playlist[i];
            if (curr.fullTitle === 'the next movie in queue')
                continue;

            if (curr.isMovie) {
                result.next = curr;
                return result;
            }
            result.intermissions.push(curr);
            result.time.add(curr.time);
        }

        return result;
    }

    /**
     * @param {Number} uid
     */
    remove(uid) {
        this.bot.connection.emit(Emit.playlist.delete, uid);
    }

    /**
     * @param {Number} afterUid
     * @param {Video} video
     */
    addEvent(afterUid, video) {
        if (this.playlist.length === 0)
            this.playlist = [video];
        else {
            const index = this.indexFromUid(afterUid);
            if (index === -1)
                return logger.error(`Found no video with UID ${afterUid} to place ${video.title} after`);
            this.playlist.splice(index + 1, 0, video);
        }
    }

    /**
     * @param offset
     * @returns {Video|null}
     */
    getVideoFromCurrent(offset) {
        let index = this.indexFromUid(this.currentUID);
        if (index === -1)
            return null;
        index = (offset + index + this.playlist.length) % this.playlist.length;
        return this.playlist[index];
    }

    /**
     * @param {Number} uid
     */
    removeEvent(uid) {
        const index = this.indexFromUid(uid);
        if (index !== -1)
            this.playlist.splice(index, 1);
    }

    /**
     * @param {Number} fromUid
     * @param {Number} afterUid
     */
    moveEvent(fromUid, afterUid) {
        const fromIndex = this.indexFromUid(fromUid);
        if (fromIndex === -1)
            return;
        const video = this.playlist.splice(fromIndex, 1)[0];
        const afterIndex = this.indexFromUid(afterUid);
        if (afterIndex === -1)
            logger.error('Cannot move video after uid');
        this.playlist.splice(afterIndex + 1, 0, video);
    }

    /**
     * @param {Video[]} videos
     */
    setPlaylist(videos) {
        if (Array.isArray(videos))
            this.playlist = videos;
        else logger.error(`Playlist is invalid: ${videos}`);
    }

    /**
     * @param {Number} currentTime
     * @param {Video} video
     */
    changeMedia(currentTime, video) {
        this.currentVideo = video;
        this.playtime = Time.fromSeconds(currentTime);
        logger.system(`Now playing ${video.displayTitle}`);
    }

    /**
     * @param {String} name
     */
    setLeader(name) {
        this.isLeader = name === this.bot.connection.name;
    }

    /**
     * @param {Number} uid
     * @param {Boolean} temp
     */
    setTemp(uid, temp) {
        const index = this.indexFromUid(uid);
        if (uid === -1)
            return logger.error(`Unknown UID ${uid} for setting temp ${temp}`);
        this.playlist[index].temp = temp;
    };

    /**
     * @param {Number} uid
     */
    updateMedia(uid) {
        this.previousUID = this.currentUID;
        this.currentUID = uid;
    }

    /**
     * @param {Number} currentTime
     * @param {Boolean} isPaused
     */
    updateCurrentMedia(currentTime, isPaused) {
        this.isPlaying = !isPaused;
        this.playtime = Time.fromSeconds(currentTime);
    }


    /**
     * @param {Video} video
     * @returns {number}
     */
    indexFromVideo(video) {
        for (let i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].id === video.id)
                return i;
        return -1;
    }

    /**
     * @param {Number} uid
     * @returns {number}
     */
    indexFromUid(uid) {
        for (let i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].uid === uid)
                return i;
        return -1;
    }

}

module.exports = Playlist;