const baseUrl = `https://new.wordsmith.org/anagram/anagram.cgi?language=english&t=500&d=&include=&exclude=&n=&m=&a=n&l=n&q=n&k=1&source=adv&anagram=`;

const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const api = require('../core/Api');
const dom = new JSDOM();
const logger = require('../core/Logger');
const utils = require('../core/Utils');
const $ = require("jquery")(dom.window);

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => api.request(baseUrl + message.msg)
        .then(resp => {
            if (resp.isFailure)
                return bot.sendMsg('Something went wrong finding anagrams :(', message);

            logger.debug(resp.result);

            // TODO: remove hack, Hack to get anagram results as the api doesnt have an actual api :(
            const anagrams = $(resp.result).getElementsByClassName('p402_premium')[0].innerText.split('Displaying all:')[1].trim().split('\n');

            logger.debug(anagrams);

            bot.sendMsg(`Anagram: ${utils.random(anagrams)}`, message);
        })
);