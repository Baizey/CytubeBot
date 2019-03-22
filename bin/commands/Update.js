const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Video = require("../structure/Playlist").Video;
const limit = require("../structure/Playlist").intermissionLimit;
const Tables = require('../persistence/structure/Tables');
const logger = require('../core/Logger');


module.exports = new Command(
    rank.admin,
    "",
    (bot, message) => {
        bot.db.connection.select(Tables.videos.name).execute()
            .then(videos => videos.map(Video.fromDatabase))
            .then(async videos => {
                bot.sendMsg(`Got ${videos.length} videos...`, message, true);
                let counter = 0;
                for (let i = 0; i < videos.length; i++) {
                    const video = videos[i];
                    const old = {
                        title: video.title,
                        year: video.year,
                        quality: video.quality
                    };
                    video.setFullTitle(video.fullTitle);
                    if (video.title !== old.title || video.year !== old.year || video.quality !== old.quality) {
                        counter++;
                        const columns = Tables.videos.columns;
                        bot.db.connection.update(Tables.videos.name)
                            .columns([columns.title.name, columns.year.name, columns.quality.name])
                            .where(Tables.videos.table.whereKeys)
                            .execute({
                                id: video.id,
                                type: video.type,
                                title: video.title,
                                year: video.year,
                                quality: video.quality
                            }).catch(logger.error);
                    }
                }
                bot.sendMsg(`Updated ${counter} videos`, message, true);
            });
    }
);