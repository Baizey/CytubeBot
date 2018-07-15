const rank = require("../structure/Ranks");
const Command = require("../structure/Command");

const exit = require("../core/Exit");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.admin,
    "",
    (bot, message) => {
        logger.system(`${message.user.name} called EXIT command on me :(`);
        exit.exit(exit.code.exit);
    }
);