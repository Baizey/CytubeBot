const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");
const Emit = require('../structure/Socket').Emit;

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        bot.connection.emit(Emit.playlist.jumpTo, bot.playlist.getVideoFromCurrent(1).uid);
    }
);