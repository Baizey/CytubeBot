const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Exit = require("../core/Exit");
module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        Exit.terminate(Exit.code.restart, 'restarted using command');
    }
);