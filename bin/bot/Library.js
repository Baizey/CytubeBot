const Message = require("../structure/Message").Message;
const User = require("../structure/Message").User;

class Library {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.message = new Message('', true, new User(bot.connection.name));
        this.bot = bot;
        this.server = bot.connection.server;
    }

    getEverything() {
        this.search("");
    }

    /**
     * @param {String} query
     */
    search(query) {
        this.server.socket.emit("searchMedia", {source: "library", query: query});
    }

    handleResults(videos) {
        const validator = this.bot.validator;
        const db = this.bot.db;
        videos = videos.filter(video => !video.isIntermission());
        this.bot.sendMsg(`Received ${videos.length} videos from the library`, this.message, true);
        videos.forEach(video => {
            if (db.isDead(video) || db.getVideoExact(video))
                return;
            validator.add(video);
        });
    }

}

module.exports = Library;