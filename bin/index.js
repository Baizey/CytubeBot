const CytubeBot = require("./bot/Bot");
const fs = require("fs");

process.on("exit", function (code) {
    if(code !== 0)
        setTimeout(() => process.exit(1), 1000);
});

let bot = null;
fs.readFile('./config.json', function (error, data) {
    if (error)
        return console.log("!ERROR! Config load failed: " + error);
    bot = new CytubeBot(JSON.parse(data + ""));
});