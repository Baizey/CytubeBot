const forever = require('forever-monitor');
const fs = require('fs');
const Log = require('./bin/core/Logger').Log;

/**
 * Initial config file to create if none exist
 */
const config = {
    'databasePath': '',
    'user': {
        'name': '',
        'password': '',
    },
    'channel': {
        'name': '',
        'password': ''
    },
    'webserver': {
        'active': false,
        'port': 8080,
        'password': '',
        'public': {
            'active': false,
            // Full domain: http://<subdomain>.localtunnel.me
            'subdomain': ''
        }
    },
    /**
     * API keys
     */
    // https://products.wolframalpha.com/api/
    'wolfram': '',
    // https://developers.google.com/apis-explorer/#p/
    'google': '',
    // https://www.themoviedb.org/documentation/api
    'TheMovieDB': '',
    // https://www.omdbapi.com/
    'OMDB': '',
    // https://www.cleverbot.com/api/
    'cleverbot': '',
};

let depth = 0;
const configString = JSON.stringify(config)
    .replace(/:/g, ': ')
    .replace(/[{\[,]/g, g => `${g}\n`)
    .replace(/[}\]]/g, g => `\n${g}`)
    .split('\n')
    .map(line => {
        depth -= /[}\]]/.test(line) ? 1 : 0;
        line = line.padStart(line.length + depth, '\t');
        depth += /[{\[]/.test(line) ? 1 : 0;
        return line;
    })
    .join('\n');

const configFile = './config.json';
const shutdownLog = './logs/shutdown.log';
fs.openSync(shutdownLog, 'a+');
try { fs.writeFileSync(configFile, configString, {flag: 'wx'}); } catch (error) {}
const logger = Log.createLogger('shutdown');

const child = new (forever.Monitor)('./bin/index.js', {
    silent: false,
    minUptime: 5000,
    spinSleepTime: 5000,
});

const shutdown = (code = 1, error = '') => {
    if (error.length > 0)
        logger.log(error);
    child.stop();
    child.kill();
    setTimeout(() => process.exit(code), 1000);
};

/**
 * @param {Number} code
 * @param {String} error
 * @returns {*}
 */
const exit = (code, error = '') => {
    if (code === 3)
        return logger.log("Bot restarting");
    switch (code) {
        case 0:
            logger.log("Bot disconnected");
            break;
        case 1:
            logger.log("Bot crashing");
            break;
        case 2:
            logger.log("Bot exiting");
            break;
        default:
            logger.log(`Exit code: ${code}`);
            break;
    }
    shutdown(code, error);
};

// process.on('uncaughtException', error => shutdown(error));

//child.on('start', (proc, data) => {});
//child.on('stop', () => exit(2));
//child.on('restart', () => exit(3));
//child.on('error', error => exit(1, error));
child.on('stderr', error => exit(1, error));
child.on('exit:code', code => exit(code));

child.start();