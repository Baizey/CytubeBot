const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        const data = bot.playlist.dataTillNextMovie;

        // No intermissions
        if (utils.isEmpty(data.intermissions))
            return bot.sendMsg(`Next movie in the queue is ${data.next.displayTitle}`, message);

        bot.sendMsg([
            `${data.time.asUnit} before next movie (${data.intermissions.length} intermissions)`,
            `Next movie in the queue is ${data.next.displayTitle}`
        ], message);
    }
);