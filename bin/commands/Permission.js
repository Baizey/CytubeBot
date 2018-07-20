const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const utils = require("../core/Utils");

// TODO: kick, mute, ban
const permissions = ["add", "skip", "poll", "restart", "choose", "disallow"];
const grants = ["true", "1", "t", "+", "yes", "y"];
const removes = ["false", "0", "f", "-", "no", "n"];

const grantsLookup = utils.listToMap(grants);
const removesLookup = utils.listToMap(removes);

module.exports = new Command(
    rank.admin,
    "",
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {

        const user = new User(message.msg.trim());
        const givenUser = !utils.isEmpty(user.name);

        if (message.hasTag("mine"))
            return bot.sendMsg(bot.db.getPermissions(givenUser ? user : message.user).join(", "), message);

        if (!utils.defined(bot.db.getUser(user)))
            return bot.sendMsg("User does not exist", message);

        if (message.hasTag("all")) {
            const table = bot.db.structure.permissions.table;
            const columns = bot.db.structure.permissions.columns;
            if (utils.defined(grantsLookup[message.getTag("all")]))
                permissions.forEach(permission => bot.db.insertPermission(user, permission));
            else if (utils.defined(removesLookup[message.getTag("all")]))
                bot.db.prepareDelete(table.name, columns.user.where()).run(user.name);
            return;
        }

        permissions.forEach(permission => {
            const used = message.hasTag(permission)
                ? permission
                : permission.charAt(0);
            if (!message.hasTag(used))
                return;
            if (utils.defined(grantsLookup[message.getTag(used)]))
                bot.db.insertPermission(user, used);
            else if (utils.defined(removesLookup[message.getTag(used)]))
                bot.db.deletePermission(user, used);
        });
    }
);