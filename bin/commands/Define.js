const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Api = require("../core/Api");
const utils = require('../core/Utils');


module.exports = new Command(
    rank.user,
    "",
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {

        const url = `api.urbandictionary.com/v0/define?term=${message.msg.trim()}`;

        Api.request(url).then(resp => {
            if (utils.isUndefined(resp.result) || utils.isUndefined(resp.result.list))
                return bot.sendMsg("No definition exists... probably", message);
            if (resp.isFailure || resp.result.list.length === 0)
                return bot.sendMsg("No definition exists... probably", message);
            return bot.sendMsg(resp.result.list[0].definition.replace(/[\[\]]/g, ''), message);
        });
    }
);