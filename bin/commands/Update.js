const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const Video = require("../structure/Playlist").Video;


module.exports = new Command(
    rank.admin,
    "",
    (bot, message) => {
        const db = bot.db;
        const tableName = db.structure.videos.table.name;
        const columns = db.structure.videos.columns;

        bot.sendMsg('Getting videos...', message, true);
        const videos = db.prepareSelect(tableName).all()
            .map(video => Video.fromDatabase(video));

        bot.sendMsg(`Updating titles... ${videos.length}`, message, true);
        videos.forEach(video => video.setFullTitle(video.fullTitle));

        bot.sendMsg('Updating database...', message, true);
        const prepare = db.prepareMultiUpdate(tableName,
            `${columns.title.where()}, ${columns.year.where()}, ${columns.quality.where()}`,
            `${columns.id.where()} AND ${columns.type.where()}`);
        videos.forEach(video => prepare.run(video.title, video.year, video.quality, video.id, video.type));

        bot.sendMsg('Done...', message, true);
    }
);