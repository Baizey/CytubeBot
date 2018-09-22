const utils = require("../core/Utils");
const Api = require("../core/Api");
const Time = require("../core/Time");

class Conversations {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.apikey = bot.apikeys.cleverbot;
        this.names = {};
        this.cs = null;
    }

    /**
     * @param {User} user
     */
    update(user) {
        this.names[user.name] = Time.current();
    };

    /**
     * @param {User} user
     * @returns {boolean}
     */
    alive(user) {
        if (utils.isUndefined(this.names[user.name]))
            return false;
        return Time.fromSeconds(15).add(this.names[user.name]).isBiggerThan(Time.current());
    };

    /**
     * @param {String} msg
     * @returns {Promise<Response>}
     */
    async getResponse(msg) {
        const self = this;
        const url = `https://www.cleverbot.com/getreply?key=${this.apikey}&input= + ${msg}`
            + (utils.isDefined(this.cs) ? `&cs=${this.cs}` : "");
        return Api.request(url).then(resp => {
            if (resp.status)
                self.cs = resp.result.cs;
            return resp;
        })
    };
}
module.exports = Conversations;