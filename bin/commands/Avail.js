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
        const video = Video.fromMessage(bot, message);
        const year = video.queryYear;

        let videos = bot.db.getVideosLike(video.title, year);

        // Filter by title and year, keep highest quality video
        const map = {};
        videos.forEach(video => {
            if (!utils.defined(map[video.title]))
                map[video.title] = [];
            const temp = map[video.title];
            for(let i = 0; i < temp.length; i++) {
                if (temp[i].year === video.year) {
                    if (qualityRank(temp[i].quality) < qualityRank(video.quality))
                        temp[i] = video;
                    return;
                }
            }
            temp.push(video);
        });

        videos = [];
        // Sort out any unknown release years
        Object.keys(map).forEach(key => {
            if (map[key].length === 1)
                return videos.push(map[key][0]);
            if (map[key].length === 2 && map[key].some(v => v.year === 0)) {
                map[key][0].year = Math.max(map[key][0].year, map[key][1].year);
                map[key][0].quality = qualityRank(map[key][0].quality) >= qualityRank(map[key][1].quality)
                    ? map[key][0].quality
                    : map[key][1].quality;
                map[key] = [map[key][0]];
            }
            map[key] = map[key]
                .filter(v => v.year > 1)
                .forEach(v => videos.push(v));
        });

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

        if (videos.length === 0)
            return bot.sendMsg(`No results for ${video.displayTitle}${year > 0 ? ` (${year})` : ''}`, message);
        if (videos.length <= 5)
            bot.sendMsg(`Here are the ${minShow} best fitting`, message);
        else
            bot.sendMsg(`Here are the ${minShow} best fitting, with ${videos.length} total results`, message);
        videos.slice(0, minShow).forEach(video => bot.sendMsg(video, message));
        bot.sendMsg(videos.slice(minShow), message, true);
    }
);