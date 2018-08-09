const ranks = require("./Ranks");
const utils = require("../core/Utils");

const tagRegex = /[\-\[](\w+)(:(\w+))?]?/g;
const commandRegex = /^[$!](\w+)/;

const staticContent = {bot: null};

class Message {
    /**
     * @param {string} msg
     * @param {string} command
     * @param {Boolean} isPm
     * @param {User} user
     */
    constructor(msg, isPm, user, command = undefined) {
        this.command = command;
        this.isPm = isPm;
        this.user = user;

        this.tags = {};

        const self = this;
        this.msg = msg.trim().replace(tagRegex, (g0, g1, g2, g3) => {
            self.tags[g1] = utils.defined(g3) ? g3 : g1;
            return ''
        });

        if (commandRegex.test(this.msg)) {
            this.command = commandRegex.exec(this.msg)[1];
            this.msg = this.msg.split(' ').slice(1).join(' ');
        }

        this.array = this.msg
            .split(";")
            .map(e => e.trim())
            .filter(e => !utils.isEmpty(e));
    }

    /**
     * @param {String} tag
     * @returns {Boolean}
     */
    hasTag(tag) {
        return utils.defined(this.tags[tag]);
    }

    /**
     * @param {String} key
     * @param {String} value
     */
    setTag(key, value = key) {
        this.tags[key] = value;
    }

    /**
     * @param {String} tag
     * @returns {String|undefined}
     */
    getTag(tag) {
        return this.tags[tag];
    }
}

class User {
    /**
     * @param {string} name
     * @param {Number} rank
     */
    constructor(name, rank = 0) {
        this.rank = ranks.getRank(rank);
        this.name = name;
    }

    /**
     * @param {String} permission
     * @returns {Boolean}
     */
    hasPermission(permission) {
        return User.static.bot.db.hasPermission(this, permission);
    }

    /**
     * @returns {{bot}}
     */
    static static() {
        return staticContent;
    }
}

module.exports = {
    User: User,
    Message: Message
};