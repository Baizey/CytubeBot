const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        bot.sendMsg(`${Math.random() >= 0.5 ? 'Yes' : 'No'}, to ${message.msg}`, message);
    }
);