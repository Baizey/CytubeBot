const join = require("path").join;
const path = function(name){
    return join(__dirname, "../..", "logs/" + name + ".log");
};

const syslog = require('simple-node-logger').createSimpleLogger({
    logFilePath: path('system'),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});
const debuglog = require('simple-node-logger').createSimpleLogger({
    logFilePath: path('debug'),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});
const errlog = require('simple-node-logger').createSimpleLogger({
    logFilePath: path('error'),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});
const chatlog = require('simple-node-logger').createSimpleLogger({
    logFilePath: path('chat'),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});
const commandlog = require('simple-node-logger').createSimpleLogger({
    logFilePath: path('commands'),
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
});

module.exports = {
    /**
     * @param {Message} message
     */
    command: function(message) { commandlog.info(`${message.command}: ${message.msg}`); },
    debug: function(msg) { debuglog.info(msg); },
    system: function(msg) { syslog.info(msg); },
    chat: function(username, pm, msg) {chatlog.info((username + (pm ? " (pm)" : "") + ": " + msg));},
    error: function(msg) { errlog.info(msg); }
};