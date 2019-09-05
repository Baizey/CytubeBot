import "../infrastructure/prototype/string.js";
import "../infrastructure/prototype/array.js";

const Publish = {
    pm: 'pm',
    public: 'chatMsg'
};

const Subscribe = {
    pm: 'pm',
    public: 'chatMsg'
};

export default class MessageService extends EventEmitter {

    /**
     * @param {CytubeService} cytube
     * @param {UserlistService} userService
     */
    constructor(cytube, userService) {
        super();
        this._cytube = cytube;
        this._userlistService = userService;
    }

    subscribe() {
        this._cytube.on(Subscribe.pm, data => this.receive(data, true));
        this._cytube.on(Subscribe.public, data => this.receive(data, false));
    }

    /**
     * @param {{
     *     time: number,
     *     username: string,
     *     msg: string
     * }} data
     * @param {boolean} isPm
     * @returns {Promise<Message>}
     */
    async receive(data, isPm) {
        const name = data.username;
        const timestamp = new Date(data.time);
        const text = data.msg.htmlDecode();
        const user = await this._userlistService.get(name);
        const command = Command.fromMessage(text);
        const message = new Message(name, text, timestamp, isPm, user, command);
        this.emit('message', message);
        return message;
    }

    /**
     * @param {string|string[]} messages
     */
    sendPublic(messages) {
        messages = this._splitMessage(messages);
        const pack = {
            meta: {}
        };
        this._send(messages, pack, Publish.public);
    }

    /**
     * @param {string|string[]} messages
     * @param {string} receiver
     */
    sendPrivate(messages, receiver) {
        messages = this._splitMessage(messages);
        const pack = {
            meta: {},
            to: receiver,
        };
        this._send(messages, pack, Publish.pm);
    }

    /**
     * @param {string[]} lines
     * @param {{meta: object, to: string|undefined, msg: string|undefined}} pack
     * @param {string} type
     */
    _send(lines, pack, type) {
        lines.forEach(line => {
            pack.msg = line;
            this._cytube.emit(type, pack);
        });
    }

    /**
     * @param {string[]} text
     * @returns {string[]}
     * @private
     */
    _splitMessage(text) {
        return text.map(line => line.htmlEncode())
            .map(line => {
                if (line.length <= 240)
                    return new Array(line);
                const result = [];
                let current = '';
                line.split(' ').forEach(word => {
                    if (current.length + word.length > 240) {
                        result.push(current + '');
                        current = '';
                    }
                    if (current) current += ' ';
                    current += word;
                });
                if (current) result.push(current + '');
                return result;
            })
            .flatMap(e => e)
            .map(e => '' + e)
            .map(e => e)
    }
}

class Command {

    static fromMessage(message) {
        const tagRegex = /[\-\[](\w+)(?::(\w+))?]?/g;
        const commandRegex = /^\s*[$!](\w+)/;
        const rawCmd = commandRegex.exec(message);
        if (rawCmd) {
            const command = rawCmd[1];
            const tags = {};
            message = message.trim().replace(tagRegex, (raw, type, value) => {
                tags[type] = value || type;
                return ''
            });
            return new Command(command, tags, message);
        }
        return undefined;
    }

    /**
     * @param {string} command
     * @param {object} tags
     * @param {string} message
     */
    constructor(command, tags, message) {
        this.message = message;
        this.command = command;
        this.tags = tags;
    }

    /**
     * @returns {string[]}
     */
    get array() {
        return this.message.split(';').trim().filter(e => e);
    }

}

class Message {

    /**
     * @param {string} name
     * @param {string} message
     * @param {Date} timestamp
     * @param {boolean} isPm
     * @param {CytubeUser} user
     * @param {Command} command
     */
    constructor(name, message, timestamp, isPm, user, command) {
        this.isPm = isPm;
        this.message = message;
        this.name = name;
        this.user = user;
        this.timestamp = timestamp;
        this.command = command;
    }


}