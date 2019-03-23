const logger = require('../core/Logger');
const Exit = require('../core/Exit');

const handleError = error => {
    logger.error(error);
    Exit.terminate(Exit.code.crash, error);
};

module.exports = handleError;