const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const utils = require("../core/Utils");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.admin,
    '',
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
        const videos = bot.db.getDeadLinks();
        const a = (i = 0) => {
            if (i >= videos.length)
                return bot.sendMsg('Done', message, true);
            bot.sendMsg(`At: ${i + 1} out of ${videos.length}`, message, true);
            bot.playlist.add(videos[i]);
            setTimeout(() => a(i + 1), 1000);
        };
        a();
    }
);