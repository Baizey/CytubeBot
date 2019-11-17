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
import LibraryService from "../Services/LibraryService";
import ValidationAgent from "../agents/linkValidation/ValidationAgent";
import CleverbotAgent from "../agents/talking/CleverbotAgent";
import YoutubeAgent from "../agents/YoutubeAgent";
import GiphyAgent from "../agents/GiphyAgent";

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

        this.chatbot = new CleverbotAgent(apiKeys.cleverbot);
        this.tmdb = new TmdbAgent(apiKeys.themovieDB);
        this.omdb = new OmdbAgent(apiKeys.omdb);
        this.youtube = new YoutubeAgent(apiKeys.google);
        this.giphy = new GiphyAgent(apiKeys.giphy);

        this.library = new LibraryService(cytube, database.aliveLinks, database.deadLinks);
        this.commands = new CommandService(this);
        this.patterns = new PatternService(database.patterns);
        this.messages = new MessageService(cytube);
        this.poll = new PollService(cytube);
        this.userlist = new UserlistService(cytube, database.users);
        this.validator = new ValidationAgent(apiKeys, this.library);
        this.playlist = new PlaylistService(cytube, this.library, this.messages);

        this.messages.on(Subscribe.message, message => this.handleMessage(message));

        this.database.setup()
            .then(async () => {
                await this.cytube.connect();

                this.poll.subscribe();
                this.userlist.subscribe();
                this.playlist.subscribe();
                this.messages.subscribe();
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

        // Log own messages (should only ever be responses to commands)
        if (message.name === this.config.user.name)
            return Logger.command(message, true);

        // If no command found, check for command patterns
        if (!message.command) {
            const pattern = this.patterns.match(message.message);
            if (pattern)
                message.command = new CytubeCommand(pattern.command, pattern.message);
        }

        // Normal message
        if (!message.command)
            return Logger.chat(message);

        // Get user info
        const user = (await this.userlist.get(message.name)) || new CytubeUser(message.name, 0);

        // Dont execute commands of user if disallowed in some way
        if (user.ignore || user.disallow || user.muted)
            return;

        // Handle command
        Logger.command(message, false);
        const response = await this.commands.run(message.command, user, message.isPm);
        this.messages.send(response.messages, response.isPm && user.name);
    }

}