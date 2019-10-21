import Command from "../Command.js";
import Rank from "../Rank.js";

export default class HelpCommand extends Command {
    constructor(bot) {
        super(bot, 'help', Rank.admin);
    }

    async run(data, user, isPm) {
        const commands = this.bot.commands.commands.values()
            .filter(e => user.rank.higherOrEqualThan(e.rank))
            .map(e => e.name)
            .join(', ');
        return Command.respond([
            'I permit you to command me to these things meatbag:',
            commands,
            'Use -tag:value as extra options like -year:1999',
            'With unlimited options like -poll title;option1;option2 you can keep going by separating with ;'
        ], isPm);
    }
}