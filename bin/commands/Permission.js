const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const utils = require("../core/Utils");

// TODO: kick, mute, ban
const permissions = ["add", "skip", "poll", "restart", "disallow", "allow", "trailer"];
const grants = ["true", "1", "t", "+", "yes", "y"];
const removes = ["false", "0", "f", "-", "no", "n"];

const permissionsLookup = utils.listToMap(permissions, v => v.charAt(0));
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
        const givenUser = utils.isUsed(user.name);

        console.log(bot.db.getPermissions(givenUser ? user : message.user));

        if (message.hasTag('mine'))
            return bot.sendMsg(bot.db.getPermissions(givenUser ? user : message.user).join(", "), message);

        if (utils.isUndefined(bot.db.getUser(user)))
            return bot.sendMsg("User does not exist", message);

        if (message.hasTag('all')) {
            const table = bot.db.structure.permissions.table;
            const columns = bot.db.structure.permissions.columns;
            if (utils.isDefined(grantsLookup[message.getTag("all")]))
                permissions.forEach(permission => bot.db.insertPermission(user, permission));
            else if (utils.isDefined(removesLookup[message.getTag("all")]))
                bot.db.prepareDelete(table.name, columns.user.where()).run(user.name);
            return;
        }

        permissions.forEach(permission => {
            if (!message.hasTag(permission))
                return;
            console.log(message.getTag(permission));
            console.log(utils.isDefined(grantsLookup[message.getTag(permission)]));
            console.log(utils.isDefined(removesLookup[message.getTag(permission)]));
            if (utils.isDefined(grantsLookup[message.getTag(permission)]))
                bot.db.insertPermission(user, permission);
            else if (utils.isDefined(removesLookup[message.getTag(permission)]))
                bot.db.deletePermission(user, permission);
        });
    }
);