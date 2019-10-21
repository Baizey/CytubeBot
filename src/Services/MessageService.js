import "../infrastructure/prototype/string.js";
import "../infrastructure/prototype/array.js";
import {EventEmitter} from 'events';
import CytubeCommand from "./models/CytubeCommand.js";
import CytubeMessage from "./models/CytubeMessage.js";


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
     */
    constructor(cytube) {
        super();
        this._cytube = cytube;
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
     * @returns {Promise<CytubeMessage>}
     */
    async receive(data, isPm) {
        const name = data.username;
        const timestamp = new Date(data.time);
        const text = data.msg.htmlDecode();
        const command = CytubeCommand.fromMessage(text);
        const message = new CytubeMessage(name, text, timestamp, isPm, command);
        super.emit('message', message);
        return message;
    }

    /**
     * @param {string|string[]} messages
     * @param {boolean} isPm
     * @param {string} receiver
     */
    send(messages, isPm, receiver) {
        if (!messages || messages.length === 0)
            return;
        if (isPm) return this.sendPrivate(messages, receiver);
        return this.sendPublic(messages);
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
        return text.map(line => line)
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

