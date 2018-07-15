const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Video = require("../structure/Playlist").Video;
const Api = require("../core/Api");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        if(message.array.length === 0)
            message.array = bot.poll.getOptions();

        Api.searchYoutube(bot, message.array, 'trailer hd official teaser').then(resp => {
            resp.reverse().forEach(link => {
                if (!link.success)
                    return bot.sendMsg(`found nothing to queue for ${link.result}`, message, true);
                bot.login.server.socket.emit("queue", link.result.asQueueObject());
            });
        });
    }
);