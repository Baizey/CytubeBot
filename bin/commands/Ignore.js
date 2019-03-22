const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        bot.db.setIgnoreUser(message.user.name, true)
            .then(resp => bot.sendMsg(resp.result, message, true));
    }
);