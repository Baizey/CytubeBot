import Database from "../database/Database.js";
import PollService from "../Services/PollService.js";
import UserlistService from "../Services/UserlistService.js";

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
        this.userlistService = new UserlistService(cytube, database.users);

        this.database.setup().finally(async () => {
            await this.cytube.connect();

            this.pollService.subscribe();
            this.userlistService.subscribe();
        });
    }


}