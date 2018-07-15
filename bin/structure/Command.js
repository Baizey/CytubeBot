const ranks = require("./ranks.js");

class Command {
    /**
     * @param {Number} rank
     * @param {String} desc
     * @param {Function} func
     */
    constructor(rank, desc, func) {
        this.rank = ranks.getRank(rank);
        this.desc = desc;
        this.function = func;
    }

    /**
     * @param {User} user
     * @returns {Boolean}
     */
    hasAccess(user) {
        return ranks.hasAccess(user, this);
    };
}

module.exports = Command;