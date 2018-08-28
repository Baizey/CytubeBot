const join = require("path").join;
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const removeUrlId = require('../structure/Playlist').removeUrlId;
const utils = require('./Utils');

class Log extends EventEmitter {
    constructor(path) {
        super();
        const self = this;
        //fs.openSync(path, 'a+');
        this.writer = fs.createWriteStream(path, {flags: 'a+'});
        this.open = false;
        this.writer.on('open', () => self.open = true);
        this.path = path;
    }

    /**
     * @param {string} msg
     */
    log(msg) {
        msg = Log.asLogFormat(msg);
        console.log(msg);
        this.writer.write(msg + '\n');
        super.emit('line', msg);
    }

    static asLogFormat(thing) {
        if (typeof thing !== 'string')
            thing = Buffer.isBuffer(thing) ? thing.toString('utf8') : JSON.stringify(thing);
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, -1);
        return thing
            .split(/\r?\n/)
            .map(line => line.replace(/([&?](?:api)?_?key=)[\w-]+/gi, (_, g) => `${g}<hidden>`))
            .map(line => removeUrlId(line))
            .map(line => line.replace(/c:(?:[\\\/]\w+)*([\\\/]cytubebot)\)/gi, (_, g) => `...${g}`))
            .filter(line => utils.isUsed(line.trim()))
            .map(line => `[${timestamp}] ${line}`)
            .join('\n');
    }

    /**
     * @param {String} name
     * @returns {Log}
     */
    static createLogger(name) {
        return new Log(shutdown);
    }
}

const createPath = name => join(__dirname, '../..', `logs/${name}.log`);
const createLog = name => new Log(createPath(name));

const system = createPath('system');
const debug = createPath('debug');
const error = createPath('error');
const chat = createPath('chat');
const commands = createPath('commands');
const shutdown = createPath('shutdown');

const systemLog = createLog('system');
const debugLog = createLog('debug');
const errorLog = createLog('error');
const chatLog = createLog('chat');
const commandLog = createLog('commands');

module.exports = {
    Log: Log,
    /**
     * @param {Message} message
     */
    chat: (message) => chatLog.log((message.user.name + (message.isPm ? " (pm)" : "") + ": " + message.msg)),
    /**
     * @param {Message} message
     */
    commands: (message) => commandLog.log(`${message.user.name} | ${message.command} | ${message.msg} | ${message.array} | ${Object.keys(message.tags).map(key => `${key}: ${message.getTag(key)}`).join(', ')}`),
    commandResponse: (message) => commandLog.log(`${message.user.name} ${message.isPm ? '(pm) ' : ''}| ${message.fullMsg}`),
    debug: (msg) => debugLog.log(msg),
    system: (msg) => systemLog.log(msg),
    error: (msg) => errorLog.log(msg),
    logs: {
        chat: chatLog,
        commands: commandLog,
        debug: debugLog,
        system: systemLog,
        error: errorLog,
    },
    paths: {
        system: system,
        commands: commands,
        debug: debug,
        chat: chat,
        error: error,
        shutdown: shutdown
    }
};