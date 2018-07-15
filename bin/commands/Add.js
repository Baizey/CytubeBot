const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Validator = require("../bot/Validator");
const Video = require("../structure/Playlist").Video;
const utils = require("../core/Utils");
const quality = require("../core/VideoQuality").rank;

module.exports = new Command(
    rank.mod,
    "",
    /**
     * @param {CytubeBot} bot
     * @param {Message} message
     */
    (bot, message) => {
        const title = message.msg.trim();
        if (message.msg.trim().startsWith('http')) {
            const video = Video.fromUrl(title);
            bot.playlist.add(video);
        } else {
            let year = message.getTag('year') - 0;
            if(isNaN(year)) year = 0;

            let videos = bot.db.getVideosByTitle(title);
            if (year !== 0)
                videos = videos.filter(video => video.year === year);

            if (videos.length === 0)
                return bot.sendMsg('No movie with this title (and year if that was given)', message);

            videos.sort((a, b) => quality(b.quality) - quality(a.quality));

            bot.playlist.add(videos[0]);
        }
    }
);