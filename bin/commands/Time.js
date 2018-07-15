const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        bot.sendMsg(bot.playlist.playtime.asPlaytime(), message);
    }
);