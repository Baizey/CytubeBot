import DatabasePattern from "../database/domain/DatabasePattern.js";

export default class PatternService {

    /**
     * @param {PatternDatabaseAgent} patternDb
     */
    constructor(patternDb) {
        this._db = patternDb;
        this.patterns = [];
    }

    async subscribe() {
        const data = await this._db.getAll();
        this.patterns = data.map(e => Pattern.fromDatabase(e));
    }

    /**
     * @param {string} message
     * @returns {{message: string, command: string}|undefined}
     */
    match(message) {
        const clean = message.toLowerCase().replace(/[,;:.?!']/g, '');
        const result = this.patterns.find(pattern => pattern.match(clean));
        if (result)
            return {
                message: result.match(clean),
                command: result.command,
            };
    }

    /**
     * returns a string if there was an issue, otherwise undefined
     * @param {String} command
     * @param {String} regex
     * @param {String} rest
     * @returns {Promise<string>}
     */
    async add(command, regex, rest) {
        if (!command || !regex)
            return "Need at least 2 inputs, command and regex";

        // Make sure the command exists
        // TODO: have list over commands
        // if (utils.isUndefined(commands[command])) return "Command doesn't exist";

        // Make sure the regex is sound
        try {
            new RegExp(regex);
        } catch (e) {
            return `Regex error: ${(e.stack.split("at RegExp", 1)[0]).trim()}`;
        }

        // rest is optional, so nothing given is simply empty string
        if (!rest) rest = '';

        await this._db.add(new DatabasePattern(command, regex, rest));
        this.patterns.push(new Pattern(command, regex, rest));
    };

    /**
     * @param {string} command
     * @returns {Promise<void>}
     */
    async removeByCommand(command) {
        this.patterns = this.patterns.filter(pattern => pattern.command !== command);
        await this._db.deleteByCommand(command);
    }

}

class Pattern {

    /**
     * @param {DatabasePattern} data
     * @returns {Pattern}
     */
    static fromDatabase(data) {
        return new Pattern(data.command, data.regex, data.rest);
    }

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
     * @returns {string}
     */
    match(message) {
        if (!this.regex.test(message))
            return undefined;
        const match = this.regex.exec(message);
        const groups = this.groups;
        let rest = this.rest;
        for (let j = 0; j < groups.length; j++)
            rest = rest.replace(groups[j], match[groups[j].slice(1) - 0]);
        return rest;
    };
}