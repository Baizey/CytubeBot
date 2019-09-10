import Database from "../database/Database.js";
import PollService from "../Services/PollService.js";
import UserlistService from "../Services/UserlistService.js";
import PlaylistService from "../Services/PlaylistService.js";
import PatternService from "../Services/PatternService.js";
import MessageService from "../Services/MessageService.js";
import CytubeUser from "../Services/models/CytubeUser.js";
import CytubeCommand from "../Services/models/CytubeCommand.js";
import TmdbAgent from "../agents/TmdbAgent.js";
import OmdbAgent from "../agents/OmdbAgent.js";
import Logger from '../infrastructure/logger/Logger.js';
import CommandService from "../Services/CommandService.js";

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

        const apiKeys = config.apikeys;
        this.tmdb = new TmdbAgent(apiKeys.themovieDB);
        this.omdb = new OmdbAgent(apiKeys.omdb);

        this.commands = new CommandService(this);
        this.patterns = new PatternService(database.patterns);
        this.messageService = new MessageService(cytube);
        this.poll = new PollService(cytube);
        this.userlist = new UserlistService(cytube, database.users);
        this.playlist = new PlaylistService(cytube, database.aliveLinks, database.deadLinks);

        this.messageService.on(Subscribe.message, message => this.handleMessage(message));

        this.database.setup()
            .then(async () => {
                await this.cytube.connect();

                this.poll.subscribe();
                this.userlist.subscribe();
                this.playlist.subscribe();
                this.messageService.subscribe();
                await this.patterns.subscribe();
            })
            .catch(error => {
                Logger.error(error);
                throw error;
            });
    }

    /**
     * @param {CytubeMessage} message
     * @returns {Promise<void>}
     */
    async handleMessage(message) {
        // Ignore messages older than 5 seconds
        const now = Date.now() - 5000;
        if (now > message.timestamp.getTime())
            return;

        // Ignore server
        if (message.name === '[server]')
            return;

        // Log own messages
        if (message.name === this.config.user.name)
            return Logger.command(message, true);

        // If no command found, check for command patterns
        if (!message.command) {
            const pattern = this.patterns.match(message.message);
            if (pattern)
                message.command = new CytubeCommand(pattern.command, pattern.message);
        }

        // Just chat
        if (!message.command)
            return Logger.chat(message);

        // Get user info
        const user = (await this.userlist.get(message.name)) || new CytubeUser(message.name, 0);

        // Dont execute commands of user if disallowed in some way
        if (user.ignore || user.disallow || user.muted)
            return;

        // Do command
        Logger.command(message, false);

        const response = this.commands.run(message.command, user, message.isPm);
        this.messageService.send(response.messages, response.isPm, user.name);
    }

}