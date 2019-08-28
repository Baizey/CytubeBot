import Database from "../database/Database.js";
import PollService from "../Services/PollService.js";

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

        this.pollService = new PollService(cytube);

        this.cytube.connect().finally(() => {
            this.pollService.subscribe();
        });
    }


}