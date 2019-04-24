const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const core = require("../core/CorePackage");
const Giphy = require("giphy-api")({https: true});
const utils = require("../core/Utils");
const log = require('../core/Logger');

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => {
        Giphy.search(message.msg.trim()).then(resp => {
            if (resp.data.length === 0)
                return bot.sendMsg("The memes has escaped!", message);
            resp = resp.data;
            const i = utils.random(0, Math.min(10, resp.length));
            bot.sendMsg(`https://media.giphy.com/media/${resp[i]["id"]}/giphy.${resp[i]["type"]}.pic`, message);
        }).catch(e => log.error(e));
    }
);