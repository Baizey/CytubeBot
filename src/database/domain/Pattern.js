export default class Pattern {

    /**
     * @param {object} pattern
     * @returns {Pattern}
     */
    static fromDatabase(pattern) {
        return pattern ? new Pattern(pattern.regex, pattern.command, pattern.rest) : null;
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