const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Tables = require("../persistence/structure/Tables");

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {

        bot.db.connection
            .select(Tables.users.name)
            .where(Tables.users.columns.disallow.where())
            .execute({disallow: true})
            .then(users => {
                if (users.length === 0)
                    return bot.sendMsg('Noone is disallowed', message, true);
                bot.sendMsg("Disallowed users:", message, true);
                bot.sendMsg(users.map(user => user.name).join(', '), message, true);
            });
    }
);