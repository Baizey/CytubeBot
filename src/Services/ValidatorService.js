import EventEmitter from 'events';
import Utils from "../infrastructure/Utils";
import '../infrastructure/prototype/string'

const Subscriptions = {
    starting: 'starting',
    dead: 'dead',
    done: 'done'
};

export default class ValidatorService {
    /**
     * @param {MessageService} message
     * @param {PlaylistService} playlist
     * @param {LibraryService} library
     */
    constructor(message, playlist, library) {
        this._message = message;
        this._library = library;
        this._playlist = playlist;
        this._emitter = new EventEmitter();

        this._subscribed = {};

        this._data = {
            total: 0,
            done: 0,
            dead: 0,
            working: false
        }
    }

    /**
     * @returns {int}
     */
    get progress() {
        if (this._data.total === 0 || !this._data.working) return 100;
        return Math.round(this._data.done / this._data.total * 100);
    }

    subscribe() {
        this._emitter.on(Subscriptions.starting,
            /**
             * @param {int} total
             */
            total => this._subscribed.keys()
                .forEach(name => this._message
                    .sendPrivate(`Beginning validation, ${total} to validate`, name)));
        this._emitter.on(Subscriptions.dead,
            /**
             * @param {{video: PlaylistVideo, data: string, success: boolean}} result
             */
            result => this._subscribed.keys()
                .forEach(name => this._message
                    .sendPrivate([`Found dead: ${(result.video.title && result.video.title.capitalize()) || result.video.fullTitle}`, `Error: ${result.data}`], name)));
        this._emitter.on(Subscriptions.done,
            /**
             * @param {{total: int, dead: int}} result
             */
            result => this._subscribed.keys()
                .forEach(name => this._message
                    .sendPrivate(`Done validation, Validated ${result.total}, found ${result.dead} dead`, name)));
    }

    _reset() {
        this._data.total = 0;
        this._data.done = 0;
        this._data.dead = 0;
        this._data.working = false;
    }

    /**
     * @returns {boolean}
     */
    validateOldLinks() {
        const self = this;
        const data = this._data;
        if (data.working) return false;
        data.working = true;
        new Promise(async resolve => {
            const videos = await self._library.getAllVideosMissingValidation();
            data.total = videos.length;
            self._emitter.emit(Subscriptions.starting, data.total);
            for (let i = 0; i < videos.length; i++) {
                const result = await self._playlist.validateVideo(videos[i]);
                result.video = videos[i];
                if (!result.success && !'This item is already on the playlist'.contains(result.data)) {
                    self._emitter.emit(Subscriptions.dead, result);
                    data.dead++;
                }
                await Utils.await(2000);
            }
            self._emitter.emit(Subscriptions.done, {total: data.total, dead: data.dead});
            self._reset();
            data.working = false;
            resolve();
        });
        return true;
    }

    /***
     * @param {string} username
     */
    addUser(username) {
        this._subscribed[username] = true;
    }

    /***
     * @param {string} username
     */
    removeUser(username) {
        delete this._subscribed[username];
    }
}

