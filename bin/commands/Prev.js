const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const video = bot.playlist.getVideoFromCurrent(-1);
        bot.sendMsg(`Previous movie (ignoring temps) was ${video.displayTitle}`, message);
    }
);