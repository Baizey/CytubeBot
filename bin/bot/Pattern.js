const Message = require("../structure/Message");
const utils = require("../core/Utils");
const commands = require("../structure/CommandDictionary");

class Patterns {
    /**
     * @param {CytubeBot} bot
     */
    constructor(bot) {
        this.bot = bot;
        this.patterns = bot.db.getPatterns();
    }

    /**
     * @param {Message} message
     */
    match(message) {
        const clean = message.msg.toLowerCase().replace(/[,;:.?!']/g, '');
        const result = this.patterns.find(pattern => utils.isDefined(pattern.match(clean)));
        if (utils.isUndefined(result))
            return false;
        message.msg = result.match(clean);
        message.command = result.command;
        return true;
    };

    /**
     * @param {String} command
     * @param {String} regex
     * @param {String} rest
     * @param {Message} message
     * @returns {*}
     */
    add(command, regex, rest, message) {
        if (utils.isUndefined(command) || utils.isUndefined(regex))
            return this.bot.sendMsg("Need at least 2 inputs, command and regex", message);

        // Make sure the command exists
        if (utils.isUndefined(commands[command]))
            return this.bot.sendMsg("Command doesn't exist", message);

        // Make sure the regex is sound
        try {
            new RegExp(regex);
        } catch (e) {
            this.bot.sendMsg(`Invalid pattern: ${regex}`, message);
            return this.bot.sendMsg(`Error: ${(e.stack.split("at RegExp", 1)[0]).trim()}`, message);
        }

        // rest is optional, so nothing given is simply empty string
        if (utils.isUndefined(rest))
            rest = "";

        this.bot.db.insertPattern(command, regex, rest);
        this.patterns.push(new Pattern(command, regex, rest));
        this.bot.sendMsg(`Pattern has been added... world domination at ${utils.random(1, 99)}%`, message);
    };

    /**
     * @param {String} command
     * @param {Message} message
     */
    delete(command, message) {
        this.bot.db.deletePattern(command);
        this.patterns = this.patterns.filter(pattern => pattern.command !== command);
        this.bot.sendMsg(`Pattern has been removed... it will be assimilated later`, message);
    };
}

class Pattern {
    /**
     * @param {String} command
     * @param {String} regex
     * @param {String} rest
     */
    constructor(command, regex, rest) {
        this.command = command;
        this.regex = new RegExp(regex);
        this.regexText = regex;
        this.rest = rest;

        this.groups = [];
        for (let j = 0; j <= 10; j++) {
            const find = "$" + j;
            if (this.rest.indexOf(find) >= 0)
                this.groups.push(find);
        }
    }

    /**
     * @param {String} message
     */
    match(message) {
        if (!this.regex.test(message))
            return null;
        const match = this.regex.exec(message);
        const groups = this.groups;
        let rest = this.rest;
        for (let j = 0; j < groups.length; j++)
            rest = rest.replace(groups[j], match[groups[j].slice(1) - 0]);
        return rest;
    };
}
module.exports = {
    Pattern: Pattern,
    Patterns: Patterns
};