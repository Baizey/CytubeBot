import Command from "../Command.js";
import Rank from "../Rank.js";
import Utils from "../../../infrastructure/Utils.js";

export default class LastOnlineCommand extends Command {
    constructor(bot) {
        super(bot, 'lastonline', Rank.anon);
    }

    async run(data, user, isPm) {
        const name = data.message.trim();
        const users = this.bot.userlist;

        if (users.isOnline(name))
            return Command.respond(`The user is currently online`, isPm);

        const foundUser = await users.get(name);

        if (!foundUser)
            return Command.respond(`No records of this user`, isPm);

        const time = Utils.time.millis(Date.now() - foundUser.lastOnline.getTime());

        return Command.respond(`The user was last online ${time.exactString} ago`, isPm);
    }
}