import * as util from 'util';

export default class Logger extends EventEmitter {

    constructor(path) {
        super();
        this._writer = fs.createWriteStream(path, {flags: 'a+'});
    }

    /**
     * @param {*} data
     */
    info(data) {
        this._log(data, 'info');
    }

    /**
     * @param {*} error
     * @param {string} msg
     */
    warn(error, msg) {
        this._log(msg, 'warning');
    }

    /**
     * @param {*} error
     * @param {string} msg
     */
    error(error, msg) {
        this._log(msg, 'error');
    }

    _log(msg, level) {
        const log = new Log(msg, level);
        const message = log.toString();
        console.log(message);
        this.writer.write(message + '\n');
        super.emit(level, message);
    }
}

class Log {
    /**
     * @param {object} data
     * @param {string} level
     */
    constructor(data, level) {
        this.timestamp = new Date().toISOString().replace('T', ' ').slice(0, -1);
        this.data = data;
        this.level = level;
    }

    _format(obj, depth = 1) {
        if (Buffer.isBuffer(obj))
            return this._format(JSON.parse(obj.toString()), depth);
        if (typeof obj !== 'object')
            return '\t'.repeat(depth) + JSON.stringify(util.inspect(obj));

        Object.keys(obj)
            .map(key => `${'\t'.repeat(depth) + key}:\n`)

    }

    /**
     * @returns {string}
     */
    toString() {
        const start = `[${this.timestamp} - ${this.level}]`;

        Object.keys(this.data).return
        JSON.stringify(this.data).split(/\r?\n/)
            .map(line => line.replace(/([&?](?:api)?_?key=)[\w-]+/gi, (_, g) => `${g}<hidden>`))
            .map(line => `${start} ${line}`)
            .join('\n');
    }

}