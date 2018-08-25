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

/**
 * Error codes:
 * 0 -> Unexpected restart / disconnect
 * 1 -> Unexpected exit / error
 * 2 -> Expected exit / command
 * 3 -> Expected restart / command
 */
const exit = (code) => {
    switch (code) {
        case 1:
            logger.log("Bot crashed");
        case 2:
            logger.log("Bot is exiting");
            break;
        case 0:
            logger.log("Bot lost connection");
        case 3:
            logger.log("Bot is restarting");
            break;
        default:
            logger.log("Exit code: " + code);
    }
    // Delay for time to log/send final messages
    if (code !== 0 && code !== 3)
        setTimeout(() => process.exit(code), 1000);
};

process.on('uncaughtException', error => {
    logger.log(error);
    exit(1);
});

const child = new (forever.Monitor)('./bin/index.js', {
    silent: false,
    minUptime: 5000
});

child.on('stderr', error => {
    logger.log(error);
    exit(1);
});

child.on('error', error => {
    logger.log(error);
    exit(1);
});

child.on('stop', () => {
    logger.log("Bot is stopping");
    exit(2);
});

child.on('exit:code', code => exit(code));

// child.on("start", function(){});
// child.on('exit', function() {});
// child.on('restart', function () {});

child.start();