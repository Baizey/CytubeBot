const rank = require("../structure/Ranks");
const Command = require("../structure/Command");

const structure = require("../structure/Database").structure;

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        const table = structure.users.table;
        const columns = structure.users.columns;
        const users = bot.db.prepareSelect(table.name, `${columns.disallow.name} > 0`)
            .all().map(user => user.name);
        bot.sendMsg("Disallowed users:", message, true);
        bot.sendMsg(users, message, true);
    }
);