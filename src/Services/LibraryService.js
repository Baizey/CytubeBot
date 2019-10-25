import PlaylistVideo from "./models/PlaylistVideo.js";
import {Quality} from "../infrastructure/video/TitleFilter";
import AliveLink from "../database/domain/AliveLink";

const levenshtein = require('fast-levenshtein');

const Publish = {
    search: 'searchMedia'
};

const Subscribe = {
    search: 'searchResults'
};

export default class LibraryService {
    /**
     * @param {CytubeService} cytube
     * @param {AliveLinksDatabaseAgent} aliveLinks
     * @param {DeadLinksDatabaseAgent} deadLinks
     */
    constructor(cytube, aliveLinks, deadLinks) {
        this._cytube = cytube;
        this._alive = aliveLinks;
        this._dead = deadLinks;
    }

    loadRawLibrary() {
        this._cytube.on(Subscribe.search, data => {
            const videos = data.map(e => PlaylistVideo.fromCytubeServer(e));
        });
        this._cytube.emit(Publish.search, {
            source: "library",
            query: ''
        });
    }

    /**
     * @returns {Promise<PlaylistVideo[]>}
     */
    async getAllVideosMissingValidation() {
        return this._alive.getAllVideosMissingValidation()
            .then(e => e.map(e => PlaylistVideo.fromAliveLink(e)));
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<PlaylistVideo>}
     */
    async getVideo(id, type) {
        return await this._alive.getByIdAndType(id, type)
            .then(e => PlaylistVideo.fromAliveLink(e));
    }

    /**
     * @param {string} title
     * @param {number} year
     * @returns {Promise<void>}
     */
    async getVideosLike(title, year = undefined) {
        return this._alive.getLike(title).map(e => {
            const video = PlaylistVideo.fromAliveLink(e);
            return {
                score: levenshtein.get(title, video.title),
                video: video
            }
        }).sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            if (year && a.year !== b.year) return Math.abs(year - a.year) - Math.abs(year - b.year);
            const quality = Quality.compare(a.quality, b.quality);
            if (quality !== 0) return quality;
            return a.year - b.year;
        }).map(e => e.video);
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<void>}
     */
    async addVideo(video) {
        // Dont remember intermissions
        if (video.isIntermission)
            return;

        const alive = await this._alive.isAlive(video.link.id, video.link.type);

        if (alive) {
            await this._alive.alter(video.asAliveDatabaseLink);
        } else
            await Promise.all([
                this._alive.add(video.asAliveDatabaseLink).catch(),
                this._dead.remove(video.asDeadDatabaseLink).catch()
            ]);
    }

    /**
     * @param {PlaylistVideo} playlistVideo
     * @returns {Promise<void>}
     */
    async removeVideo(playlistVideo) {
        await Promise.all([
            this._alive.add(playlistVideo.asAliveDatabaseLink).catch(),
            this._dead.remove(playlistVideo.asDeadDatabaseLink).catch()
        ]);
    }

    /**
     * @param {PlaylistVideo} video
     * @returns {Promise<boolean>}
     */
    async isDead(video) {
        return await this._dead.getByIdAndType(video.link.id, video.link.type).then(e => !!e);
    }
}

