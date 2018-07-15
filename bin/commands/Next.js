const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const video = bot.playlist.getVideoFromCurrent(1);
        bot.sendMsg(`Next movie in the queue is ${video.displayTitle}`, message);
    }
);