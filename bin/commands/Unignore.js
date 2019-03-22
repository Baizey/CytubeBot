const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");


module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        bot.db.setIgnoreUser(message.user.name, false)
            .then(resp => bot.sendMsg(resp.result, message, true));
    }
);