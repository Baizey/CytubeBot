import Command from "../Command.js";
import Rank from "../Rank.js";

export default class SayCommand extends Command {
    constructor(bot) {
        super(bot, 'say', Rank.admin);
    }

    async run(data, user, isPm) {
        return Command.respond(data.message, isPm);
    }
}