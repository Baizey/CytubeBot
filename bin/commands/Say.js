const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Message = require("../structure/Message").Message;

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        const fake = new Message('', false, message.user);
        bot.sendMsg(message.msg, fake);
    }
);