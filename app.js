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
        "active": true,
        "port": 8080,
        "public": {
            "active": true,
            // Full domain: http://<subdomain>.localtunnel.me
            "subdomain": ''
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
const shutdownLog = "./logs/shutdown.log";
fs.openSync(shutdownLog, 'a+');
try {
    fs.writeFileSync(configFile, configString, {flag: 'wx'});
} catch (error) {
    // Ignore, this means file already exists
}

process.on('uncaughtException', error => {
    console.log(Log.asLogFormat(error));
    process.exit(1);
});

const child = new (forever.Monitor)('./bin/index.js', {
    silent: false,
    minUptime: 5000,
    errFile: shutdownLog
});

child.on('stderr', error => {
    console.log(Log.asLogFormat(error.toString()));
    process.exit(1);
});

child.on('error', (error) => console.log(`\nBot got error: ${error}\n`));

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
        case 1:
            console.log("\nBot crashed");
        case 2:
            console.log("\nBot is exiting\n");
            break;
        case 0:
            console.log("\nBot lost connection");
        case 3:
            console.log("\nBot is restarting\n");
            break;
        default:
            console.log("Code: " + code);
    }
    // Delay for time to log/send final messages
    if (code !== 0 && code !== 3)
        setTimeout(() => process.exit(code), 1000);
});

// child.on("start", function(){});
// child.on('exit', function() {});
// child.on('restart', function () {});

child.start();