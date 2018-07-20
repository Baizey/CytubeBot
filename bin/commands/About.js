const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");
const Api = require("../core/Api");
const Video = require("../structure/Playlist").Video;

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        const video = Video.fromTitle(bot, message.msg.trim());
        Api.searchTheMovieDatabase(bot, message, video, '').then(resp => {
           if(!resp.success) return;
           const result = resp.result;
            bot.sendMsg(`**${video.displayTitle}**`, message);
            if (utils.defined(result.status) && result.status !== "Released")
                bot.sendMsg(`**Status ${result.status}**`, message);
            else
                bot.sendMsg(`**Rated ${result.vote_average} from ${result.vote_count} votes**`, message);

            if (utils.defined(result.tagline))
                bot.sendMsg(`**${result.tagline}**`, message);

            bot.sendMsg(`**Plot** ${result.overview}`, message);

            if (utils.defined(result.genres))
                bot.sendMsg(`**Genres** ${result.genres.map(e => e.name).join(", ")}`, message);

            bot.sendMsg(`**Imdb link** https://www.imdb.com/title/${result.imdb_id}/`, message);
        });
    }
);