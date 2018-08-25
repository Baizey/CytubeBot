const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.admin,
    'Crashes the bot... mostly for testing shit',
    (bot, message) => {
        return t.a;
    }
);