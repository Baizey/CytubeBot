const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        message.msg = message.user.name;
        bot.db.setIgnoreUser(1, bot, message);
    }
);