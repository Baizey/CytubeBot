const Video = require("../structure/Playlist").Video;

const sentenceFilter = [
    "movieji com",
    "the film crew",
    'robert donat',
    "super 720p",
    "english dub",
    "full sci fi",
    "full animation",
    "sci fi",
    "nonton film",
    "nonton movie",
    'eng sub',
    "web dl",
    "full original",
    'with trivia',
    "silent movie",
    "eng dub",
    "hindi dubbed movie",
    "english sub",
    "full movie online",
    "watch full movie",
    "full movie",
    "copy of the",
    "copy of",
    "ultimate edition",
    "full hd",
    "in hq",
    "movie online",
    "anniversary edition",
    "for free on openmovies",
    "icinema27 com",
    "8bro com",
    "Patrick Swayze & Jamie Lee Curtis in",
    "short film",
    "phim74 net"
];

const wordFilter = [
    "http",
    "https",
    "www",
    "m4v",
    "mst3k",
    "saphirebluray",
    "h264",
    "hdts",
    "uncut",
    "br",
    "wmv",
    "321watching",
    "vie",
    "reddit",
    "com/r/fullmoviesongoogle",
    "dvdscr",
    "youtubefullmovies",
    "fullmoviesongoogle",
    "r",
    "subtitle",
    "scifi",
    "thriller",
    "webrip",
    "hdfilm",
    "hdtv",
    "ry",
    "http:",
    "xvid",
    "|",
    "suptitulada",
    "nonton",
    "mp4",
    "mkv",
    "avi",
    "divx",
    "flv",
    "hd",
    "fileanime",
    "1080p",
    "720p",
    "480p",
    "360p",
    "240p",
    "geckos",
    "agassi",
    "1080",
    "720",
    "480",
    "360",
    "240",
    "#ezchannel",
    "hq",
    "bluray",
    "cam",
    "ext",
    "hdrip",
    "cinemaindo",
    "extended",
    "unrated",
    "yify",
    "director's",
    "remastered",
    "flickmov",
    "dvdrip",
    "brrip",
    "x264",
    "/",
    "criterion",
    "synecdoche",
    "mhd",
    "tikimovies",
    "hc",
    "juragantomatx",
    "axxo",
];

const Quality = require("./VideoQuality");
const utils = require("./Utils");

const wordLookup = utils.listToMap(wordFilter);

/**
 * @param {String} title
 * @returns {string}
 */
function applyBasicFilter(title) {
    return title.replace(/[,_~/\\\-]+/g, ' ')                                               // Handle space replacer
        .replace(/(^|[ .])\w+\.(com|org|net)($|[ .])/g, `$1${wordFilter[0]}$3`)     // Remove simple urls
        .replace(/\.+/g, ' ')                                                       // Handle dots after url
        .trim().replace(/  +/g, ' ')                                                // Remove redundant whitespace
        .toLowerCase();
}

/**
 * @param {String} title
 * @returns {string}
 */
function filterTitle(title) {
    // Filter out known sentences not part of titles
    sentenceFilter.forEach(sentence => title = title.replace(sentence, wordFilter[0]));

    // Remove IMDB ids
    title = title.replace(/tt\d+/g, wordFilter[0]);

    // Split title into words
    const words = title.trim().replace(/ +/g, ' ').split(" ");

    // Figure out what parts of the title is the actual movie title
    let i = 0;
    for (; i < words.length; i++)
        if (utils.isUndefined(wordLookup[words[i]]))
            break;
    let j = i + 1;
    for (; j < words.length; j++)
        if (utils.isDefined(wordLookup[words[j]]))
            break;

    if (i >= words.length) title = "";
    else title = words.slice(i, j).join(" ");

    return title.replace(/ ?& ?/g, ' and ').replace(/[':]/g, '');
}

/**
 * @param {String} title
 * @returns {string[]}
 */
function splitToWords(title) {
    // Split it by words ignoring brackets
    return title
        .replace(/[\[<{()}>\]]/g, ' ')
        .replace(/  +/g, ' ')
        .split(" ");
}

/**
 * @param {String} title
 * @param {Number} year
 * @returns {string}
 */
function removeReleaseYear(title, year = 0) {
    return year === 0 ? title : title.replace(year + '', wordFilter[0]);
}

/**
 * @param {String[]} input
 * @returns {string}
 */
function guessQuality(words) {
    let rank = 99;
    let quality = "";
    words.forEach(word => {
        if (utils.isUndefined(Quality.mapping[word]))
            return;
        if (Quality.rank(word) < rank) {
            rank = Quality.rank(word);
            quality = Quality.mapping[word];
        }
    });
    return quality;
}

/**
 * @param {String[]} words
 * @returns {number}
 */
function guessReleaseYear(words) {
    let year = 0;
    words.forEach(word => {
        const number = word - 0;
        if (word.length !== 4 || isNaN(number))
            return;

        // Within realistic release years
        if (number < 1930 || number > 2020
            // Used to catch cases such as '2012' released in 2009
            || Math.abs(2008 - number) >= Math.abs(2008 - year))
            return;

        year = number;
    });
    return year;
}

function removeBrackets(title) {
    for (let i = 0, start = -1, depth = 0; i < title.length; i++) {
        if ('<{[('.indexOf(title.charAt(i)) >= 0) {
            depth++;
            start = Math.max(start, i);
        } else if (')]}>'.indexOf(title.charAt(i)) >= 0) {
            depth--;
            if (depth === 0 && start >= 0) {
                title = `${title.substr(0, start)} ${title.substr(i + 1, title.length)}`;
                i = start;
                start = -1;
            }
        }
    }
    return title;
}

class MovieInfo {
    /**
     * @param {String} fullTitle
     */
    constructor(fullTitle) {
        this.fullTitle = fullTitle;

        this.title = applyBasicFilter(fullTitle);
        const words = splitToWords(this.title);

        this.releaseYear = guessReleaseYear(words);
        this.quality = guessQuality(words);

        this.titleWithReleaseYear = removeBrackets(this.title);
        this.titleWithReleaseYear = filterTitle(this.titleWithReleaseYear);

        this.title = removeBrackets(this.title);
        this.title = removeReleaseYear(this.title, this.releaseYear);
        this.title = filterTitle(this.title);
    }
}

const VideoUtils = {
    /**
     * @param {String} fullTitle
     * @returns {MovieInfo}
     */
    filterTitle: fullTitle => new MovieInfo(fullTitle),
    wordFilter: wordFilter,
    sentenceFilter: sentenceFilter,
};

module.exports = VideoUtils;