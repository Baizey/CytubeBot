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
        const shouldManage = message.hasTag("manage");

        const seen = {};
        bot.playlist.playlist.forEach(v => {
            if (utils.isUndefined(seen[v.title]))
                seen[v.title] = [];
            seen[v.title].push(v);
        });

        const duplicates = Object.keys(seen).map(key => seen[key]).filter(list => list.length > 1);

        if (utils.isEmpty(duplicates))
            bot.sendMsg("No duplicates found", message, true);

        duplicates.forEach(list => {
            const say = ['Possible duplicates:'].concat(list.map(v => v.fullTitle));
            bot.sendMsg(say, message, true);
            bot.sendMsg('------------', message, true);
            if (shouldManage)
                list.slice(1).forEach(v => bot.playlist.remove(v.uid));
        });
    }
);