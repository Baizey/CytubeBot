const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Video = require("../structure/Playlist").Video;
const Api = require("../core/Api");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        const video = Video.fromMessage(bot, message);
        Api.searchTheMovieDatabase(bot, message, video, 'similar').then(resp => {
            if (!resp.success) return;
            bot.sendMsg('Found these similar movies', message);
            bot.sendMsg(resp.result.results.map(e => e.title).join(", "), message);
        });
    }
);