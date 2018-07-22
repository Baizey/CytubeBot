const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        bot.connection.emit("jumpTo", bot.playlist.getVideoFromCurrent(1).uid);
    }
);