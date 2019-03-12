const baseUrl = `https://new.wordsmith.org/anagram/anagram.cgi?language=english&t=500&d=&include=&exclude=&n=&m=&a=n&l=n&q=n&k=1&source=adv&anagram=`;

const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const api = require('../core/Api');
const logger = require('../core/Logger');
const utils = require('../core/Utils');

module.exports = new Command(
    rank.user,
    "",
    (bot, message) => api.request(baseUrl + message.msg, false)
        .then(resp => {
            if (resp.isFailure)
                return bot.sendMsg('Something went wrong finding anagrams :(', message);

            logger.debug(resp.result);

            // TODO: remove hack, Hack to get anagram results as the api doesnt have an actual api :(
            const anagrams = getAnagrams(resp.result);

            logger.debug(anagrams);

            if (utils.isUndefined(anagrams))
                bot.sendMsg('Something went wrong getting anagrams :(', message);
            else if (anagrams.length > 0)
                bot.sendMsg(`Anagram: ${utils.random(anagrams)}`, message);
            else
                bot.sendMsg(`Found no anagrams for ${message.msg}`, message);
        })
);

function getAnagrams(body) {
    let temp = body.split('Displaying all:')[1];
    if (!temp) temp = body.split('Displaying first 500:')[1];
    if (!temp) return null;
    return temp.split('<script>')[0].replace(/<br>|<\/b>/g, '').trim().split('\n');
}