const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");
const Api = require("../core/Api");
const Video = require("../structure/Playlist").Video;

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        const video = Video.fromMessage(bot, message);
        Api.searchTheMovieDatabase(bot, message, video, ['', 'credits']).then(resp => {
            const detailsWrapper = resp[0];
            const credits = resp[1];

            if(!detailsWrapper.success || !credits.success) return;
            const details = detailsWrapper.result;
            const actors = credits.result.cast.slice(0, 10).map(actor => actor.name).join(', ');

            const saying = [];

            if (utils.isDefined(details.status) && details.status !== "Released")
                saying.push(`**Status ${details.status}**`);
            else
                saying.push(`**Rated ${details.vote_average} from ${details.vote_count} votes**`);

            if (utils.isDefined(details.tagline))
                saying.push(`**${details.tagline}**`);

            saying.push(`**Plot** ${details.overview}`);

            if (utils.isDefined(details.genres))
                saying.push(`**Genres** ${details.genres.map(e => e.name).join(", ")}`);

            if (utils.isUsed(actors))
                saying.push(`**Cast** ${actors}`);

            saying.push(`**Imdb link** https://www.imdb.com/title/${details.imdb_id}/`);

            bot.sendMsg(saying, message);
        });
    }
);