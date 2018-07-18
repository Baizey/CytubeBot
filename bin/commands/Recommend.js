const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Video = require("../structure/Playlist").Video;
const Api = require("../core/Api");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {

        const video = Video.fromTitle(bot, message.msg.trim());
        let url = `api.themoviedb.org/3/search/movie?api_key=${bot.apikeys.themovieDB}&query=${video.title}${video.urlQueryYear()}`;
        Api.request(url).then(resp => {
            if(!resp.success || utils.isEmpty(resp.result.results))
                return bot.sendMsg('No movie found', message);
            const result = resp.result.results[0];
            const get = 'recommendations';
            url = `api.themoviedb.org/3/movie/${result.id}/${get}?api_key=${bot.apikeys.themovieDB}&language=en-US`;
            Api.request(url).then(resp => {
                if (!resp.success || utils.isEmpty(resp.result.results))
                    return bot.sendMsg('...perhaps the archives are incomplete? How can I find the id, but not find the movie! This is unfair! This is outrageous!', message);
                bot.sendMsg('Found these recommendations:', message);
                bot.sendMsg(resp.result.results.map(e => e.title).join(", "), message);
            })
        });
    }
);