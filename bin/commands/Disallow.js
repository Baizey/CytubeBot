const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const structure = require("../structure/Database").structure;
const logger = require('../core/Logger');

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        if (bot.db.setDisallowUser(1, bot, message))
            logger.system(`Disallowed ${message.msg}`);
        else
            logger.system(`${message.user.name} is not high enough rank to allow ${message.msg}`)
    }
);