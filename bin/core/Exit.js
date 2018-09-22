const logger = require("./Logger");
const utils = require('./Utils');

const code = {
    disconnect: 0,
    crash:      1,
    exit:       2,
    restart:    3
};

const codeMapping = {
    0: 'Disconnected',
    1: 'Crashed',
    2: 'Exiting',
    3: 'Restarting'
};

const mapCode = code => codeMapping[code] || 'Unknown code';

module.exports = {
    code: code,

    /**
     * @param {Number} code
     * @param {String} reason
     */
    terminate: (code, reason) => {
        logger.system(`${mapCode(code)}: ${reason}`);
        setTimeout(() => process.exit(code), 500)
    }
};