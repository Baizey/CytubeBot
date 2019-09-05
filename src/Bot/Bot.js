import Database from "../database/Database.js";
import PollService from "../Services/PollService.js";
import UserlistService from "../Services/UserlistService.js";
import PlaylistService from "../Services/PlaylistService.js";

export default class Bot {

    /**
     * @param {Config} config
     * @param {CytubeService} cytube
     * @param {Database} database
     */
    constructor(config, cytube, database) {
        this.cytube = cytube;
        this.config = config;
        this.database = database;

        this.poll = new PollService(cytube);
        this.userlist = new UserlistService(cytube, database.users);
        this.playlist = new PlaylistService(cytube, database.aliveLinks, database.deadLinks);
        
        this.database.setup().finally(async () => {
            await this.cytube.connect();

            this.poll.subscribe();
            this.userlist.subscribe();
            this.playlist.subscribe();
        });
    }


}