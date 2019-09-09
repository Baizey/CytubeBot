import Logger from './logger/Logger.js';

const code = {
    disconnect: 0,
    crash: 1,
    exit: 2,
    restart: 3,
    kicked: 4,
    banned: 5,
};

const codeMapping = {
    0: 'Disconnected',
    1: 'Crashed',
    2: 'Exiting',
    3: 'Restarting',
    4: 'Kicked',
    5: 'Banned',
};

const mapCode = code => codeMapping[code] || 'Unknown code';

export default {
    code: code,
    /**
     * @param {Number} code
     * @param {String} reason
     */
    terminate: (code, reason) => {
        Logger.system(`${mapCode(code)}: ${reason}`);
        setTimeout(() => process.exit(code), 1000)
    }
};