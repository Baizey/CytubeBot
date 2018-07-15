const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const exit = require("../core/Exit");
module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        exit.exit(exit.code.restart);
    }
);