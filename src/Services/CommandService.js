import SayCommand from "./models/commands/SayCommand.js";
import Command from "./models/Command.js";
import '../infrastructure/prototype/array.js';
import LastOnlineCommand from "./models/commands/LastOnlineCommand.js";
import {ExitCommand, RestartCommand} from "./models/commands/ExitCommand.js";
import HelpCommand from "./models/commands/HelpCommand.js";
import AboutCommand from "./models/commands/AboutCommand";

const commandConstructors = [
    AboutCommand,
    SayCommand,
    LastOnlineCommand,
    ExitCommand,
    RestartCommand,
    HelpCommand,
];

export default class CommandService {
    /**
     * @param {Bot} bot
     */
    constructor(bot) {
        this._commands = commandConstructors
            .map(Command => new Command(bot))
            .toObject(e => e.name, e => e);
    }

    /**
     * @returns {{say:Command}}
     */
    get commands() {
        return this._commands;
    }

    /**
     * @param {CytubeCommand} data
     * @param {CytubeUser} user
     * @param {boolean} isPm
     * @returns {{messages: string[], isPm: boolean}}
     */
    async run(data, user, isPm) {
        const command = this._commands[data.name];

        if (!command)
            return Command.respond('Command does not exist', isPm);

        if (command.rank.higherThan(user.rank))
            return Command.respond('Command requires higher rank', isPm);

        return await command.run(data, user, isPm);
    }

}