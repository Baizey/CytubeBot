export default class DatabasePattern {

    /**
     * @param {object} pattern
     * @returns {DatabasePattern}
     */
    static fromDatabase(pattern) {
        return pattern ? new DatabasePattern(pattern.regex, pattern.command, pattern.rest) : null;
    }

    /**
     * @param {string} regex
     * @param {string} command
     * @param {string} rest
     */
    constructor(regex, command, rest) {
        this.regex = regex;
        this.command = command;
        this.rest = rest;
    }
}