import PlaylistVideo from "./models/PlaylistVideo.js";

const Subscribe = {
    playlist: 'playlist',
    update: 'mediaUpdate',
    change: 'changeMedia',
    setCurrent: 'setCurrent',
    move: 'moveVideo',
    setTemp: 'setTemp',
    setLeader: 'setLeader',
    delete: 'delete',
    queue: 'queue',
};

const Publish = {
    queue: 'queue',
    jumpTo: 'jumpTo',
    request: 'requestPlaylist',
    delete: 'delete'
};

export default class PlaylistService {

    /**
     * @param {CytubeService} cytube
     * @param {LibraryService} library
     */
    constructor(cytube, library) {
        this._library = library;
        this._cytube = cytube;
        this.playlist = [];
        this.currentUid = null;
        this.currentPlaytime = 0;
        this.isPlaying = true;
    }

    subscribe() {
        const self = this;
        this._cytube.on(Subscribe.playlist, data => self.playlist = data.map(e => PlaylistVideo.fromCytubeServer(e)));
        this._cytube.on(Subscribe.update, data => self.currentPlaytime = data.currentTime);
        this._cytube.on(Subscribe.setCurrent, uid => self.currentUID = uid);
        this._cytube.on(Subscribe.move,
            /**
             * @param {{from:number, after:number}} data
             */
            data => {
                const fromIndex = self._indexFromUid(data.from);
                if (fromIndex === -1) return;
                const video = self.playlist.splice(fromIndex, 1)[0];
                const afterIndex = self._indexFromUid(data.after);
                if (afterIndex === -1) return;
                self.playlist.splice(afterIndex + 1, 0, video);
            });
        this._cytube.on(Subscribe.setTemp,
            /**
             * @param {{uid: number, temp: boolean}} data
             */
            data => {
                const index = self._indexFromUid(data.uid);
                if (index === -1) return;
                self.playlist[index].temp = data.temp;
            });
        // this._cytube.on(Subscribe.setLeader, data => { /* not used */ });
        this._cytube.on(Subscribe.delete,
            /**
             * @param {{uid: number}} data
             */
            data => {
                const index = self._indexFromUid(data.uid);
                if (index !== -1) self.playlist.splice(index, 1);
            });
        this._cytube.on(Subscribe.queue, async data => {
            const video = PlaylistVideo.fromCytubeServer(data.item);
            await self._library.addVideo(video);
            if (self.playlist.length === 0)
                self.playlist.push(video);
            else {
                const index = self._indexFromUid(data.after);
                if (index === -1) return;
                this.playlist.splice(index + 1, 0, video);
            }
        });

        this._cytube.emit(Publish.request);
    }

    /**
     * @param {Number} uid
     */
    remove(uid) {
        this._cytube.emit(Publish.delete, uid);
    }

    /**
     * @param {number} offset
     * @returns {PlaylistVideo}
     */
    getFromPlaylist(offset = 0) {
        const from = this._indexFromUid(this.currentUid);
        if (from === -1) return undefined;
        const at = from + offset;
        const secured = Math.max(0, Math.min(this.playlist.length, at));
        return this.playlist[secured];
    }

    /**
     * @param {Number} uid
     * @returns {number}
     */
    _indexFromUid(uid) {
        for (let i = 0; i < this.playlist.length; i++)
            if (this.playlist[i].uid === uid)
                return i;
        return -1;
    }

}

