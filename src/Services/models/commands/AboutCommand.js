import Command from "../Command.js";
import Rank from "../Rank.js";

export default class AboutCommand extends Command {
    constructor(bot) {
        super(bot, 'about', Rank.admin);
    }

    async run(data, user, isPm) {



    }
}