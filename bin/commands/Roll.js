const rank = require("../structure/Ranks");
const Command = require("../structure/Command");
const utils = require("../core/Utils");

module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const dices = message.msg.split(';')
            .filter(d => /^\d+d\d+$/.test(d))
            .map(d => new Dice(d));
        bot.sendMsg(dices.map(d => d.roll()), message);
    }
);

class Dice {

    constructor(text) {
        this.text = text;
        const t = text.split('d');
        this.amount = Math.min(10, Number(t[0]));
        this.sides = Math.max(2, Math.min(9999, Number(t[1])));
    }

    roll() {
        const result = [];
        for (let i = 0; i < this.amount; i++) {
            const number = utils.random(1, this.sides + 1);
            if (number === this.sides)
                result.push(`Natural ${number}!`);
            else if (number === 1)
                result.push(`Critical Failure`);
            else
                result.push(utils.random(1, this.sides + 1));
        }
        return `Rolling ${this.amount} d${this.sides}... ${result.join(', ')}`;
    }

}