import Database from "../database/Database.js";
import PollService from "../Services/PollService.js";
import UserlistService from "../Services/UserlistService.js";
import PlaylistService from "../Services/PlaylistService.js";
import PatternService from "../Services/PatternService.js";
import MessageService from "../Services/MessageService.js";
import CytubeUser from "../Services/models/CytubeUser.js";

const Subscribe = {
    message: 'message'
};

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

        this.patterns = new PatternService(database.patterns);
        this.messageService = new MessageService(cytube);
        this.poll = new PollService(cytube);
        this.userlist = new UserlistService(cytube, database.users);
        this.playlist = new PlaylistService(cytube, database.aliveLinks, database.deadLinks);

        this.messageService.on(Subscribe.message, message => this.handleMessage(message));

        this.database.setup().then(async () => {
            await this.cytube.connect();

            this.poll.subscribe();
            this.userlist.subscribe();
            this.playlist.subscribe();
            this.messageService.subscribe();
        });
    }

    /**
     * @param {Message} message
     */
    async handleMessage(message) {
        const now = Date.now() - 5000;
        // Ignore messages older than 5 seconds
        if (now > message.timestamp.getTime())
            return;

        // Ignore server and bots own messages
        if (message.name === '[server]' || message.name === this.config.user.name)
            return;

        if (!message.command) {
            const pattern = this.patterns.match(message.message);
            if (pattern) {
                message.command = pattern.command;
                message.message = pattern.message;
            }
        }

        // Just chat
        if (!message.command)
            return;

        const user = await this.userlist.get(message.name) || new CytubeUser(message.name, 0);

        // Ignore specific user
        if (user.ignore || user.disallow)
            return;

        // Do command
    }

}