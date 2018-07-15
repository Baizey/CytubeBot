const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        if (bot.db.setDisallowUser(0, bot, message))
            logger.system(`Disallowed ${message.msg}`);
        else
            logger.system(`${message.user.name} is not high enough rank to allow ${message.msg}`);
    }
);