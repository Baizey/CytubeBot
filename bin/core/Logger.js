const Log = require('simple-node-logger');
const join = require("path").join;

const createLog = name => Log.createSimpleLogger({
    logFilePath: join(__dirname, '../..', `logs/${name}.log`),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

const systemLog = createLog('system');
const debugLog = createLog('debug');
const errorLog = createLog('error');
const chatLog = createLog('chat');
const commandLog = createLog('commands');

module.exports = {
    /**
     * @param {Message} message
     */
    chat: function(message) {chatLog.info((message.user.name + (message.isPm ? " (pm)" : "") + ": " + message.msg));},
    /**
     * @param {Message} message
     */
    command: function(message) { commandLog.info(`${message.user.name} | ${message.command} | ${message.msg}`); },
    debug: function(msg) { debugLog.info(msg); },
    system: function(msg) { systemLog.info(msg); },
    error: function(msg) { errorLog.info(msg); }
};