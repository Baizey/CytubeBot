const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");


module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        message.msg = message.user.name;
        bot.db.setIgnoreUser(0, bot, message);
    }
);