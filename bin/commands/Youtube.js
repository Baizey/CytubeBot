const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Api = require("../core/Api");
const utils = require("../core/Utils");
const Emit = require('../structure/Socket').Emit;


module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        Api.searchYoutube(bot, message.array).then(resp => {
            resp.reverse().forEach(link => {
                if (link.isFailure)
                    return bot.sendMsg(`found nothing to queue for ${link.result}`, message, true);
                bot.connection.emit(Emit.playlist.queue, link.result.asQueueObject());
            });
        });
    }
);