export default class CommandResponse {

    static empty() {
        return new CommandResponse();
    }

    /**
     * @param {string|string[]} messages
     * @param {boolean} isPm
     */
    constructor(messages = [], isPm = false) {
        this.isPm = isPm;
        this.messages = Array.isArray(messages) ? messages : [messages];
    }

}