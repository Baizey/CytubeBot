const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const utils = require("../core/Utils");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.admin,
    '',
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
    }
);