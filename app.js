const forever = require('forever-monitor');
const fs = require('fs');

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

const shutdownLog = "./logs/shutdown.log";
initiateBot = function () {
    const child = new (forever.Monitor)("./bin/index.js", {
        silent: false,
        minUptime: 5000,
        errFile: shutdownLog
    });

    child.on('error',  (error) => console.log(`\nBot got error: ${error}\n`));

    child.on('stop', () => console.log("\nBot is stopping\n"));

    /**
     * Error codes:
     * 0 -> Unexpected restart / disconnect
     * 1 -> Unexpected exit / error
     * 2 -> Expected exit / command
     * 3 -> Expected restart / command
     */
    child.on('exit:code', (code) => {
        switch (code) {
            case 1: console.log("\nBot crashed");
            case 2: console.log("\nBot is exiting\n");
                break;
            case 0: console.log("\nBot lost connection");
            case 3: console.log("\nBot is restarting\n");
                break;
            default: console.log("Code: " + code);
        }
        // Delay for time to log/send final messages
        if (code < 3 && code > 0)
            setTimeout(() => process.exit(code), 1000);
    });

    // child.on("start", function(){});
    // child.on('exit', function() {});
    // child.on('restart', function () {});

    child.start();
};

const ensureLogExist = () =>
    fs.exists(shutdownLog, (exists) => exists
        ? initiateBot()
        : fs.writeFile(shutdownLog, {flag: 'wx'}, () => initiateBot()));

console.log(configString);

const configFile = './config.json';
fs.exists(configFile, exists => exists
    ? ensureLogExist()
    : fs.writeFile(configFile, configString, 'utf8', () => ensureLogExist()));