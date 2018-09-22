const rank = require("../structure/Ranks");
const Command = require("../structure/Command");

const Exit = require("../core/Exit");
const logger = require("../core/Logger");

module.exports = new Command(
    rank.admin,
    "",
    (bot, message) => {
        Exit.terminate(Exit.code.exit, 'Exited using command');
    }
);