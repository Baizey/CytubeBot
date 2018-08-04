const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const utils = require("../core/Utils");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.admin,
    "",
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
        const removeFromPlaylist = message.hasTag("manage");

        const seen = {};
        bot.playlist.playlist.forEach(v => {
            if (!utils.defined(seen[v.title]))
                seen[v.title] = [];

            if (bot.db.isDead(v)) {
                logger.debug(`Dead link in playlist: ${v.fullTitle}`);
                bot.sendMsg(`Dead: ${v.fullTitle}`, message, true);
                if (removeFromPlaylist)
                    bot.playlist.remove(v.uid);
            } else
                seen[v.title].push(v);

        });

        const duplicates = Object.keys(seen).map(key => seen[key]).filter(list => list.length > 1);

        if (utils.isEmpty(duplicates))
            bot.sendMsg("No duplicates found", message, true);

        duplicates.forEach(list => {
            const say = ['Possible duplicates:'].concat(list.map(v => v.fullTitle));
            logger.debug(say.join("\n"));
            bot.sendMsg(say, message, true);
            bot.sendMsg('------------', message, true);
            if (removeFromPlaylist)
                list.slice(1).forEach(v => bot.playlist.remove(v.uid));
        });
    }
);