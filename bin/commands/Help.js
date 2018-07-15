const rank = require("../structure/Ranks");
const utils = require("../core/Utils");
const Command = require("../structure/Command");

module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const dictionary = require("../structure/CommandDictionary");
        const cmd = message;
        if (utils.defined(dictionary[cmd]))
            if (dictionary[cmd].hasAccess(message.user))
                return bot.sendMsg(dictionary[cmd].desc, message);
            else
                return bot.sendMsg(`You are not authorized for the command ${cmd}, sorry :(`, message);
        if (cmd.length > 0)
            return bot.sendMsg(`No command found named '${cmd}', say '$help' for a list over available commands :)`, message);

        const commands = Object.keys(dictionary)
            .filter(command => dictionary[command].hasAccess(message.user));

        bot.sendMsg(commands.join(", "), message, true);
        bot.sendMsg('Commands has a common pattern to how arguments are given', message, true);
        bot.sendMsg('Tags can be included in the format [tag], both space and case sensitive, sometimes with values like [year:2000]', message, true);
        bot.sendMsg('If multiple arguments are given they should be divided by ;', message, true);
    }
);