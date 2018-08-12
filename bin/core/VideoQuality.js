const utils = require("./Utils");
const mapping = {
    "cam": "cam",
    "hdts": "hdts",

    "240": "240p",
    "240p": "240p",

    "360": "360p",
    "360p": "360p",

    "480": "480p",
    "480p": "480p",

    "720": "720p",
    "720p": "720p",

    "1080": "1080p",
    "1080p": "1080p",
};

const order = {
    "cam": 1,
    "hdts": 2,
    "240p": 3,
    "360p": 4,
    "480p": 5,
    "720p": 6,
    "1080p": 7,
};


module.exports = {
    rank: (str) => utils.isDefined(order[mapping[str]]) ? order[mapping[str]] : 0,
    order: order,
    mapping: mapping
};