export default class CytubeMessage {

    /**
     * @param {string} name
     * @param {string} message
     * @param {Date} timestamp
     * @param {boolean} isPm
     * @param {CytubeCommand} command
     */
    constructor(name, message, timestamp, isPm, command) {
        this.isPm = isPm;
        this.message = message;
        this.name = name;
        this.timestamp = timestamp;
        this.command = command;
    }

}