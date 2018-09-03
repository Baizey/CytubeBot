const logger = require("./Logger");
const utils = require('./Utils');

const code = {
    disconnect: 0,
    crash: 1,
    exit: 2,
    restart: 3
};

module.exports = {
    code: code,
    /**
     * @param {Number} exitCode
     * @param {String} reason
     */
    exit: (exitCode, reason = "") => {
        if (utils.isUsed(reason))
            switch (exitCode) {
                case code.disconnect:
                    logger.system(`Disconnected: ${reason}`);
                    break;
                case code.crash:
                    logger.system(`Crashed: ${reason}`);
                    break;
                case code.exit:
                    logger.system(`Exiting: ${reason}`);
                    break;
                case code.restart:
                    logger.system(`Restarting: ${reason}`);
                    break;
            }
        setTimeout(() => process.exit(exitCode), 500)
    }
};