const rank = require("../structure/Ranks");
const Command = require("../structure/Command");

const core = require("../core/CorePackage");
const Api = core.Api;

module.exports = new Command(
    rank.guest,
    "",
    (bot, message) => {
        const url = `checkiday.com/api/3/?d=today`;
        Api.request(url).then(resp => {
            if(!resp.success)
                return;
            resp = resp.result.holidays;
            const list = [];
            for (let i in resp)
                list.push(resp[i].name);
            bot.sendMsg(list.join(", "), message);
        })
    }
);