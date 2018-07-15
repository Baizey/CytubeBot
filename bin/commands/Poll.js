const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        if (message.array.length === 0)
            return bot.sendMsg('Need at least a title for the poll', message);
        bot.poll.create(message.array[0], message.array.slice(1), message.hasTag('anon'));
    }
);