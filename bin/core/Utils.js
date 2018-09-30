// Jquery
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const htmlEncode = require('htmlencode').htmlEncode;
const dom = new JSDOM();
const $ = require("jquery")(dom.window);
const logger = require("./Logger");
const chatLimit = 240;

const utils = {

    /**
     * @returns {number}
     */
    chatLimit: () => chatLimit,

    /**
     * @param {*} thing
     * @returns {Boolean}
     */
    isUndefined: thing => !utils.isDefined(thing),

    /**
     * @param {*} thing
     * @returns {Boolean}
     */
    isDefined: thing => typeof(thing) !== 'undefined' && thing !== null,

    /**
     * @param {*} thing
     * @returns {boolean}
     */
    isUsed: thing => !utils.isEmpty(thing),

    /**
     * @param {*} thing
     * @returns {Boolean}
     */
    isEmpty: thing => {
        // Covers null and undefined
        if (utils.isUndefined(thing))
            return true;
        // noinspection FallThroughInSwitchStatementJS
        switch (typeof(thing)) {
            case "object": thing = Object.keys(thing);
            case "string": thing = thing.length;
            case "number": thing = thing === 0;
            case "boolean": return thing;
            default: return false;
        }
    },

    /**
     * @param {String} v
     * @returns {String}
     */
    htmlDecode: (v) => $('<textarea/>').html(v).text(),

    /**
     * @param {String} v
     * @returns {String}
     */
    htmlEncode: (v) => htmlEncode(v),

    /**
     * @param {Object[]} list
     * @param {Function} keyFunction
     * @param {Function} valueFunction
     * @returns {object}
     */
    listToMap: function (list, keyFunction = v => v, valueFunction = v => v) {
        return list.reduce((map, value) => {
            const key = keyFunction(value, map, list);
            map[key] = valueFunction(value, key, map, list);
            return map;
        }, {});
    },

    /**
     * @param {Object} map
     * @param {Function} valueFunction
     * @returns {Object[]}
     */
    mapToList: function (map, valueFunction = (k, v) => v) {
        return Object.keys(map).map(key => valueFunction(key, map[key]));
    },

    /**
     * @param {Object[]} list
     * @returns {Object[]}
     */
    distinct: (list) => {
        return utils.mapToList(utils.listToMap(list));
    },

    /**
     * @param {number} number
     * @param {string} name
     * @returns {string}
     */
    pluralise: (number, name) => `${number} ${name}${number > 1 ? 's' : ''}`,

    /**
     * @param {String|String[]} msg
     * @returns {String[]}
     */
    splitAccordingToLimits: (msg) => {
        if (utils.isUndefined(msg))
            return ["null"];

        if (Array.isArray(msg)) {
            let result = [];
            msg.forEach(e => result = result.concat(utils.splitAccordingToLimits(e)));
            return result;
        }

        if (typeof msg !== "string")
            msg = msg + "";

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
     * @param {String} msg
     * @returns {string}
     */
    asExtraLine: (msg) => {
        const lastWord = msg.substr(msg.lastIndexOf(" ") + 1);
        if (lastWord.startsWith("http"))
            return `[flip]${msg} [/flip]`;
        return `[flip]${msg}[/flip]`
    },

    /**
     * @param {String|String[]} msgs
     * @returns {String[]}
     */
    formatMessage: (msgs) => {
        msgs = utils.splitAccordingToLimits(msgs);
        if (msgs.length <= 1)
            return msgs;
        const result = [];
        let curr = '';
        msgs.forEach(msg => {
            if(utils.isEmpty(curr))
                return (curr = msg);
            const temp = utils.asExtraLine(msg);
            if (curr.length + temp.length <= chatLimit)
                return (curr += temp);
            result.push(curr);
            curr = msg;
        });
        if(utils.isUsed(curr))
            result.push(curr);
        return result;
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