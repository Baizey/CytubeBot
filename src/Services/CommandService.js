import '../infrastructure/prototype/array.js';
import * as Commands from "./models/Command";
import '../infrastructure/prototype/object.js'

export default class CommandService {
    /**
     * @param {Bot} bot
     */
    constructor(bot) {
        this._commands = Object.keys(Commands)
            .map(e => Commands[e])
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