import * as path from 'path';
import * as fs from 'fs';
import {EventEmitter} from 'events';
import * as util from 'util';

class Log extends EventEmitter {

    constructor(name) {
        super();
        const base = path.resolve();
        this.path = path.join(base, `logs/${name}.log`);
        this._writer = fs.createWriteStream(this.path, {flags: 'a+'});
    }

    /**
     * @param {string} msg
     */
    log(msg) {
        msg = Log.asLogFormat(msg);
        console.log(msg);
        this._writer.write(msg + '\n');
        super.emit('line', msg);
    }

    /**
     * @param {*} thing
     * @returns {string}
     */
    static asLogFormat(thing) {
        if (typeof thing !== 'string')
            thing = Buffer.isBuffer(thing)
                ? thing.toString()
                : JSON.stringify(util.inspect(thing));
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, -1);
        return thing
            .split(/[\n\r\t]+/gm)
            .map(line => line.replace(/([&?](?:api)?_?key=)[\w-]+/gi, (_, g) => `${g}<hidden>`))
            .map(line => line.replace(/c:(?:[\\\/]\w+)*([\\\/]cytubebot)\)/gi, (_, g) => `...${g}`))
            .map(line => line.replace(/("id":\s*")[\w\-]+(")/gi, (_, a, b) => `${a}<hidden>${b}`))
            .filter(line => line.trim())
            .map(line => `[${timestamp}] ${line}`)
            .join('\n')
    }
}

const createLog = name => new Log(name);

let _instance;

export default class Logger {

    /**
     * @returns {Logger}
     */
    static get instance() {
        return _instance ? _instance : (_instance = new Logger());
    }

    /**
     * @returns {Log}
     */
    get system() {
        return this._systemLog ? this._systemLog : (this._systemLog = createLog('system'));
    }

    /**
     * @returns {Log}
     */
    get debug() {
        return this._debugLog ? this._debugLog : (this._debugLog = createLog('debug'));
    }

    /**
     * @returns {Log}
     */
    get warning() {
        return this._warningLog ? this._warningLog : (this._warningLog = createLog('warning'));
    }

    /**
     * @returns {Log}
     */
    get error() {
        return this._errorLog ? this._errorLog : (this._errorLog = createLog('error'));
    }

    /**
     * @returns {Log}
     */
    get chat() {
        return this._chatLog ? this._chatLog : (this._chatLog = createLog('chat'));
    }

    /**
     * @returns {Log}
     */
    get commands() {
        return this._commandLog ? this._commandLog : (this._commandLog = createLog('commands'));
    }

    /**
     * @param {string} message
     */
    static system(message) {
        Logger.instance.system.log(message);
    }

    /**
     * @param {*} data
     */
    static debug(data) {
        Logger.instance.debug.log(data);
    }

    /**
     * @param {*} exception
     */
    static warn(exception) {
        Logger.instance.warning.log(exception);
    }

    /**
     * @param {*} exception
     */
    static error(exception) {
        Logger.instance.error.log(exception);
    }

    /**
     * @param {CytubeMessage} message
     */
    static chat(message) {
        const pm = message.isPm ? ' (pm)' : '';
        Logger.instance.chat.log(`${message.name}${pm}: ${message.message}`);
    }

    /**
     * @param {CytubeMessage} message
     * @param {boolean} isBot
     */
    static command(message, isBot = false) {
        if (isBot) {
            const pm = message.isPm ? ' (pm)' : '';
            Logger.instance.commands.log(`${message.name}${pm}: ${message.message}`);
            return;
        }
        const command = message.command;
        const tags = Object.keys(command.tags).map(e => e + ': ' + command.tags[e]).join(', ');
        Logger.instance.commands.log(`${message.name} | ${command.name} | ${command.message} | ${command.array} | ${tags}`);
    }
}