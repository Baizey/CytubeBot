const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
module.exports = new Command(
    rank.user,
    "",
    async (bot, message) => {
        if (message.hasTag('mine')) {
            const nominations = await bot.db.getNominationsByUsername(message.user.name);
            bot.sendMsg('Your nominations are as following:', message, true);
            bot.sendMsg(
                nominations,
                message,
                true
            );
        } else if (message.hasTag('top')) {
            const nominations = await bot.db.getNominations(bot.userlist.getNames());
            bot.sendMsg('Top 5 nominations are as following:', message);
            bot.sendMsg(
                nominations.slice(0, 5).map(n => `${n.title} ${n.year ? `(${n.year})` : ''} | ${n.votes} votes`),
                message,
            );
        } else if (message.hasTag('delete')) {
            bot.db.deleteNominationsByUsername(message.user.name).finally();
            bot.sendMsg('Deleted all your previous nominations :)', message);
        } else {
            const resp = await bot.db.insertNomination(message);
            bot.sendMsg(resp.result, message);
        }
    }
);