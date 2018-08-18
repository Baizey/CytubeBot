const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const msg = message.msg.toLowerCase().trim();
        bot.conversations.getResponse(msg)
            .then(resp => {
                if(resp.isFailure)
                    return;
                bot.sendMsg(resp.result.output, message);
            });
    }
);