import "regenerator-runtime";

export default class Command {
    /**
     * @param {Bot} bot
     * @param {string} name
     * @param {Rank} minimumRank
     */
    constructor(bot, name, minimumRank) {
        this.bot = bot;
        this._rank = minimumRank;
        this._name = name;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {Rank}
     */
    get rank() {
        return this._rank;
    }

    /**
     * @param {CytubeCommand} data
     * @param {CytubeUser} user
     * @param {boolean} isPm
     * @returns {Promise<{isPm: boolean, messages: string[]}>}
     */
    async run(data, user, isPm) {
        throw `Command '${this.name}' not implemented yet`;
    }

    /**
     * @param {string[]|string} messages
     * @param {boolean} isPm
     * @returns {{isPm: boolean, messages: string[]}}
     */
    static respond(messages = [], isPm = false) {
        return {
            messages: Array.isArray(messages) ? messages : [messages],
            isPm: isPm
        }
    }
}