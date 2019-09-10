import SayCommand from "./models/commands/SayCommand.js";
import Command from "./models/Command.js";
import '../infrastructure/prototype/array.js';

const commandConstructors = [
    SayCommand
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
    run(data, user, isPm) {
        const command = this._commands[data.name];

        if (!command)
            return Command.respond('Command does not exist', isPm);

        if (command.rank.higherThan(user.rank))
            return Command.respond('Command requires higher rank', isPm);

        return command.run(data, user, isPm);
    }

}