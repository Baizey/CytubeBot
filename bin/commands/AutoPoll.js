const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Message = require("../structure/Message").Message;
const User = require("../structure/Message").User;
const utils = require("../core/Utils");
const quality = require("../core/VideoQuality").rank;

function autoPolling(bot, message, options) {
    const next = bot.playlist.getVideoFromCurrent(1);
    if(next.isIntermission())
        return setTimeout(() => autoPolling(bot, message, options), 1000);

    bot.poll.close(new User('Botshua'));

    const winner = options[bot.poll.pickWinner().title];
    bot.sendMsg(`The winner is ${winner.title}`, message);

    let videos = bot.db.getVideosByTitle(winner.title);
    if(winner.year !== 0)
        videos = videos.filter(video => video.year === winner.year);
    if (videos.length === 0)
        return bot.sendMsg('No video to queue as winner...?', message);
    videos.sort((a, b) => quality(b.quality) - quality(a.quality));
    bot.playlist.add(videos[0]);
}


module.exports = new Command(
    rank.admin,
    "",
    (bot, message) => {
        let nominations = bot.db.getNominations(bot.userlist.getNames());
        nominations = nominations.slice(0, Math.min(5, nominations.length));
        bot.poll.create(
            'Next movie',
            nominations.map(e => e.key),
            message.hasTag('anon'));

        if (!message.hasTag('auto'))
            return;

        const commands = require('../structure/CommandDictionary');
        const intermissionMessage = new Message('Cyanide and happiness short dog', false, message.user);
        const botMessage = new Message('', false, message.user);

        // EXPERIMENTAL AUTO-POLL HANDLING FOR THE BOT
        bot.sendMsg('Oh boi, here I got taking over human labour again', message);
        commands.youtube.function(bot, intermissionMessage);
        setTimeout(() => {
            commands.trailer.function(bot, botMessage);
            setTimeout(() => autoPolling(bot, botMessage, utils.listToMap(nominations, v => v.key)), 1000);
        }, 1000);
    }
);