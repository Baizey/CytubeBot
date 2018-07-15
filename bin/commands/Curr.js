const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        const video = bot.playlist.getVideoFromCurrent(0);
        bot.sendMsg(`Current movie is ${video.displayTitle}`, message);
    }
);