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
        Api.searchTheMovieDatabase(bot, message, video, 'recommendations').then(resp => {
            if (resp.isFailure) return;
            bot.sendMsg('Found these recommended movies', message);
            bot.sendMsg(resp.result.results.map(e => e.title).join(", "), message);
        }).catch(e => {throw e});
    }
);