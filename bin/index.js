const CytubeBot = require("./bot/Bot");
const fs = require("fs");
const config = fs.readFileSync('./config.json');
const bot = new CytubeBot(JSON.parse(config));