const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {

        if (message.hasTag('my')) {

            const nominations = bot.db.getNominations([message.user.name])
                .map(n => `${n.key} | ${n.votes} votes`);
            bot.sendMsg('Your nominations are as following:', message, true);
            nominations.forEach(n => bot.sendMsg(n, message, true));
        }
        else if (message.hasTag('top')) {
            const nominations = bot.db.getNominations(bot.userlist.getNames())
                .map(n => `${n.key} | ${n.votes} votes`);
            bot.sendMsg('Top 5 nominations are as following:', message);
            nominations.slice(0, Math.min(5, nominations.length)).forEach(n => bot.sendMsg(n, message));
        }
        else if(message.hasTag('delete')) {

            const table = bot.db.structure.nominate.table;
            const columns = bot.db.structure.nominate.columns;
            bot.db.prepareDelete(table.name, columns.user.where()).run(message.user.name);
            bot.sendMsg('Deleted all your previous nominations :)', message);
        } else {
            const resp = bot.db.insertNomination(message);
            bot.sendMsg(resp.result, message);
        }
    }
);