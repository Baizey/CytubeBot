const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");
const Api = require("../core/Api");
const Video = require("../structure/Playlist").Video;

module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const dices = message.msg.split(' ')
            .filter(d => d.test(/\d+d\d+/))
            .map(d => new Dice(d));
        bot.sendMsg(dices.map(d => d.roll()), message);
    }
);

class Dice {

    constructor(text) {
        this.text = text;
        const t = text.split('d');
        this.amount = Math.min(10, Number(t[0]));
        this.sides = Math.min(9999, Number(t[1]));
    }

    roll() {
        const result = [];
        for (let i = 0; i < this.amount; i++)
            result.push(utils.random(1, this.sides + 1));
        return this.text + ': ' + result.join(', ');
    }

}