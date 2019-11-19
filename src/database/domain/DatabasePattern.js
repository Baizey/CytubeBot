export default class DatabasePattern {

    /**
     * @param {object} pattern
     * @returns {DatabasePattern}
     */
    static fromDatabase(pattern) {
        return pattern ? new DatabasePattern(pattern.command, pattern.regex, pattern.rest) : null;
    }

    /**
     * @param {string} regex
     * @param {string} command
     * @param {string} rest
     */
    constructor(command, regex, rest) {
        this.regex = regex;
        this.command = command;
        this.rest = rest;
    }
}