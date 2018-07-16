const utils = require("../core/Utils");
const Time = require("../core/Time");
const Video = require("../structure/Playlist").Video;
const logger = require("../core/Logger");
const Validator = require("./Validator");

class Playlist {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.bot = bot;
        this.isLeader = false;
        this.isPlaying = true;
        this.playtime = Time.of();
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
        this.bot.connection.server.socket.emit("queue", video.asQueueObject());
        logger.system(`Queuing link: ${video.url}`);
    }

    /**
     * @param {Number} uid
     */
    remove(uid) {
        this.bot.connection.server.socket.emit("remove", uid);
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
        this.bot.validator.add(video, null);
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
        const afterIndex = this.indexFromUid(afterUid);
        if (fromIndex === -1 || afterIndex === -1)
            return;
        const video = this.playlist.splice(fromIndex, 1)[0];
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
        this.playtime = Time.ofSeconds(currentTime);
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
        this.playtime = Time.ofSeconds(currentTime);
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