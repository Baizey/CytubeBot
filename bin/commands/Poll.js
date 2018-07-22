const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Message = require("../structure/Message").Message;
const User = require("../structure/Message").User;
const utils = require("../core/Utils");
const quality = require("../core/VideoQuality").rank;

function pollManager(bot, message, options) {
    const next = bot.playlist.getVideoFromCurrent(1);
    if(next.isIntermission())
        return setTimeout(() => pollManager(bot, message, options), 1000);

    bot.poll.close(new User(bot.connection.name));

    const winner = options[bot.poll.pickWinner().title];
    bot.sendMsg(`The winner is ${winner.title}`, message);

    let videos = bot.db.getVideosByTitle(winner.title);
    if(Math.round(winner.year) !== 0)
        videos = videos.filter(video => video.year === winner.year);
    if (videos.length === 0) {
        return bot.sendMsg('No video to queue as winner...?', message, true);
    }
    videos.sort((a, b) => quality(b.quality) - quality(a.quality));
    bot.playlist.add(videos[0]);
}

/**
 * @param {CytubeBot} bot
 * @param {Message} message
 */
function queuePollFromNomination(bot, message) {
    let nominations = bot.db.getNominations(bot.userlist.getNames());
    nominations = nominations.slice(0, Math.min(5, nominations.length));
    bot.poll.create(
        'Next movie',
        nominations.map(e => e.key),
        message.hasTag('anon'));

    if (!message.hasTag('manage'))
        return;

    const commands = require('../structure/CommandDictionary');
    const intermissionMessage = new Message('Cyanide and happiness short dog', message.isPm, message.user);
    const trailerMessage = new Message('', message.isPm, message.user);

    // EXPERIMENTAL AUTO-POLL HANDLING FOR THE BOT
    bot.sendMsg('Oh boi, here I got taking over human labour again', message);
    commands.youtube.function(bot, intermissionMessage);
    setTimeout(() => {
        commands.trailer.function(bot, trailerMessage);
        setTimeout(() => pollManager(bot, trailerMessage, utils.listToMap(nominations, v => v.key)), 5000);
    }, 1000);
}

module.exports = new Command(
    rank.mod,
    "",
    (bot, message) => {
        if (message.hasTag('close')) {
            bot.connection.emit('closePoll');
            const winner = bot.poll.pickWinner().title.replace(/[']/g, '');
            bot.sendMsg(`I pick ${winner} as winner!`, message);
            if (message.hasTag('manage'))
                require('../structure/CommandDictionary').add.function(bot,
                    new Message(winner.replace(/.*[|\-]/, ''), true, message.user));
            return;
        }

        if (message.hasTag('auto'))
            return queuePollFromNomination(bot, message);

        if (message.array.length === 0)
            return bot.sendMsg('Need at least a title for the poll', message);
        bot.poll.create(message.array[0], message.array.slice(1), message.hasTag('anon'));
    }
);