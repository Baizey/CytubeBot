const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Message = require("../structure/Message").Message;

module.exports = new Command(
    rank.admin,
    "",
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
        const patterns = bot.patterns;
        if (message.hasTag('all')) {
            bot.sendMsg("Told as: command | regex | rest", message, true);
            patterns.patterns.forEach(pattern =>
                bot.sendMsg(`${pattern.command} | ${pattern.regexText} | ${pattern.rest}`, message, true)
            );
        } else if (message.hasTag('delete'))
            patterns.delete(message.msg.trim().toLowerCase(), message);
        else
            bot.patterns.add(message.array[0], message.array[1], message.array[2], message);
    }
);