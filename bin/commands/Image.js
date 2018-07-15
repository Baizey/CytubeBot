const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        bot.sendMsg("Under construction", message);
    }
);