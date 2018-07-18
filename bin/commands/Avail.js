const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const levenshtein = require('fast-levenshtein');
const utils = require("../core/Utils");
const qualityRank = require("../core/VideoQuality").rank;
const Video = require("../structure/Playlist").Video;

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        const video = Video.fromTitle(bot, message.msg);
        const year = video.queryYear;

        let videos = bot.db.getVideosLike(video.title, year);

        videos.forEach(m => m.display = `${m.releaseYear === 0 ? '    ' : m.releaseYear} | ${m.displayTitle} ${m.quality === '' ? '' : `(${m.quality}`})`);
        videos = utils.mapToList(utils.listToMap(videos, v => v.display));

        videos.forEach(m => m.score = levenshtein.get(video.title, m.title));
        videos.sort((a, b) => {
            if (a.score !== b.score)
                return a.score - b.score;
            if(a.quality !== b.quality)
                return qualityRank(b) - qualityRank(a);
            return b.year - a.year;
        });


        videos = videos.map(video => `${video.year > 0 ? video.year : '????'} | ${video.displayTitle} ${utils.isEmpty(video.quality) ? '' : `(${video.quality})`}`);

        const minShow = Math.min(5, videos.length);
        bot.sendMsg(`Here are the ${minShow} best fitting, with ${videos.length} total results`, message);
        videos.slice(0, minShow).forEach(video => bot.sendMsg(video, message));
        bot.sendMsg(videos.slice(minShow), message, true);
    }
);