import AliveLink from "../../database/domain/AliveLink.js";
import DeadLink from "../../database/domain/DeadLink.js";
import Link from "../../infrastructure/video/Link.js";

export default class PlaylistVideo {

    /**
     * @param {AliveLink} link
     * @returns {PlaylistVideo}
     */
    static fromAliveLink(link) {
        if (!link) return undefined;
        const video = new PlaylistVideo(link.id, link.type);
        video.fullTitle = link.fullTitle;
        video.title = link.title;
        video.year = link.year;
        video.quality = link.quality;
        video.duration = link.duration;
        video.validateBy = new Date(link.validateBy);
        return video;
    }

    /**
     * @param {DeadLink} link
     * @returns {PlaylistVideo}
     */
    static fromDeadLink(link) {
        if (!link) return undefined;
        return new PlaylistVideo(link.id, link.type);
    }

    /**
     * @param {{temp:boolean, queuedBy:string, uid:number, media: { title:string, seconds:number, id: string, type: string }}} data
     * @returns {PlaylistVideo}
     */
    static fromCytubeServer(data) {
        const media = (typeof data.media !== 'undefined') ? data.media : data;
        const video = new PlaylistVideo(media.id, media.type);
        video.isTemp = data.temp;
        video.queuedBy = data.queuedBy;
        video.uid = data.uid;
        video.duration = media.seconds;
        video.fullTitle = media.title;
        return video;
    }

    /**
     * @param {string} id
     * @param {string} type
     */
    constructor(id, type) {
        this.link = new Link(id, type);

        this.title = undefined;
        this.year = undefined;
        this.quality = undefined;
        this.duration = undefined;
        this.validateBy = new Date();

        this.isTemp = undefined;
        this.queuedBy = undefined;
        this.uid = undefined;
    }

    get isIntermission() {
        return this.duration < 60 * 20;
    }

    /**
     * @returns {AliveLink}
     */
    get asAliveDatabaseLink() {
        return new AliveLink(this.link.id, this.link.type, this.title, this.fullTitle, this.year, this.duration, this.quality, 0);
    }

    /**
     * @returns {DeadLink}
     */
    get asDeadDatabaseLink() {
        return new DeadLink(this.link.id, this.link.type);
    }

    /**
     * @returns {{temp: *, pos: string, id: string, type: string}}
     */
    get asQueueObject() {
        return {
            temp: this.isIntermission,
            pos: "next",
            id: this.link.id,
            type: this.link.type
        };
    }

}