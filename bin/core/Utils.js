// Jquery
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const dom = new JSDOM();
const $ = require("jquery")(dom.window);
const logger = require("./Logger");
const chatLimit = 240;

const utils = {

    modlog: function (bot, cmd, username, target) {
        const clearUser = utils.safeName(username);
        let msg = "'" + clearUser + "' used '" + cmd + "'";
        let log = "'" + username + "' used '" + cmd + "'";
        if (utils.defined(target)) {
            msg += " on '" + utils.safeName(target) + "'";
            log += " on '" + (target) + "'";
        }
        bot.sendMsg(msg);
        logger.system(log);
    },

    /**
     * @param {Number} int
     * @returns {Boolean}
     */
    bool: function (int) {
        return int === 1;
    },

    /**
     * @param thing
     * @returns {Boolean}
     */
    defined: function (thing) {
        return typeof(thing) !== 'undefined' && thing !== null;
    },

    /**
     * @param thing
     * @returns {Boolean}
     */
    isEmpty: function (thing) {
        // Covers null and undefined
        if (!utils.defined(thing))
            return true;
        // noinspection FallThroughInSwitchStatementJS
        switch (typeof(thing)) {
            // Turn object to array
            case "object":
                thing = Object.keys(thing);
            // Turn array to number
            case "string":
                thing = thing.length;
            // Turn number to boolean
            case "number":
                thing = thing === 0;
            // Return boolean
            case "boolean":
                return thing;
            // Functions and unknowns
            default:
                return false;
        }
    },

    /**
     * @param {String} v
     * @returns {String}
     */
    htmlDecode: function (v) {
        return $('<textarea/>').html(v).text();
    },

    /**
     * @param {Object[]} list
     * @param {Function} keyFunction
     * @param {Function} valueFunction
     */
    listToMap: function (list, keyFunction = v => v, valueFunction = v => v) {
        let map = {};
        list.forEach(value => {
            const key = keyFunction(value);
            map[key] = valueFunction(value, key, map, list);
        });
        return map;
    },

    /**
     * @param {Object} map
     * @param {Function} valueFunction
     * @returns {Object[]}
     */
    mapToList: function (map, valueFunction = (key, value) => value) {
        const list = [];
        Object.keys(map).forEach(key => list.push(valueFunction(key, map[key])));
        return list;
    },

    /**
     * @param {Object[]} list
     * @returns {Object[]}
     */
    distinct: (list) => {
        return utils.mapToList(utils.listToMap(list));
    },

    /**
     * @param {String|String[]} msg
     * @returns {String[]}
     */
    splitMessage: (msg) => {
        if (!utils.defined(msg))
            return ["null"];
        if (typeof msg !== "string")
            return msg;

        msg = utils.htmlDecode(msg);

        if (msg.length < chatLimit)
            return [msg];

        const messages = [];
        let current = [];
        let length = 0;
        msg.split(" ").forEach(word => {
            if (current.length > 0
                && length + 1 + word.length > chatLimit) {
                messages.push(current.join(" "));
                current = [];
                length = 0;
            }
            if(current.length > 0) length++;
            current.push(word);
            length += word.length;
        });
        if (current.length > 0)
            messages.push(current.join(" "));
        return messages;
    },

    /**
     * @param {number|Array} min
     * @param {number} max
     * @returns {number}
     */
    random: (min = 0, max = min) =>
        typeof min === 'number'
            ? (min === max ? min : min + Math.floor(Math.random() * Math.abs(max - min)))
            : min[utils.random(0, min.length)],

    /**
     * Removes chance of word being emoted (and user being sque-ed)
     * @param {string} name
     * @returns {string}
     */
    safeName: (name) => name.charAt(0) + '\u00AD' + name.slice(1),
};

module.exports = utils;