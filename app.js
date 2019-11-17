import * as forever from "forever-monitor";
const Monitor = forever.default.Monitor;
import * as fs from "fs";

/**
 * Initial config file to create if none exist
 */
const config = {
    'user': {
        'name': '',
        'password': '',
    },
    'channel': {
        'name': '',
        'password': ''
    },
    'database': {
        'host': 'localhost',
        'port': 5432,
        'database': '',
        'user': '',
        'password': ''
    },

    'apikeys': {
        // https://developers.giphy.com/dashboard/
        "giphy": '',
        // https://products.wolframalpha.com/api/
        'wolfram': '',
        // https://developers.google.com/apis-explorer/#p/
        'google': '',
        // https://www.themoviedb.org/documentation/api
        'TheMovieDB': '',
        // https://www.omdbapi.com/
        'OMDB': '',
        // https://www.cleverbot.com/api/
        'cleverbot': ''
    }
};

/*
 * Turns config into a pretty formatted json string
 */
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
const log = data => fs.writeFileSync(shutdownLog, data + '\n', {flag: 'a+'});

try {
    fs.writeFileSync(configFile, configString, {flag: 'wx'});
} catch (error) {
}

const child = new Monitor('./src/index.js', {
    silent: false,
    minUptime: 5000,
    spinSleepTime: 5000,
    command: "node --experimental-modules",
});

const shutdown = (code = 1, error = '') => {
    if (Buffer.isBuffer(error)) error = error.toString();
    if (error.length > 0)
        log(error);
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
    switch (code) {
        case 4:
            log('Bot got kicked');
        case 0:
            log("Bot disconnected");
        case 3:
            return log("Bot restarting");
        case 5:
            log('Bot got banned');
        case 1:
            log("Bot crashing");
        case 2:
            log("Bot exiting");
        default:
            log(`Exit code: ${code}`);
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