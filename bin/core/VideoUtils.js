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

const quality = require("./VideoQuality");
const utils = require("./Utils");

const wordLookup = utils.listToMap(wordFilter);

class MovieInfo {
    /**
     * @param {String} fullTitle
     */
    constructor(fullTitle) {
        const self = this;
        this.fullTitle = fullTitle;

        this.title = fullTitle
            .replace(/[,_~/\\\-]+/g, ' ')                                               // Handle space replacer
            .replace(/(^|[ .])\w+\.(com|org|net)($|[ .])/g, `$1${wordFilter[0]}$3`)     // Remove simple urls
            .replace(/\.+/g, ' ')                                                       // Handle dots after url
            .trim().replace(/  +/g, ' ')                                                // Remove redundant whitespace
            .toLowerCase();

        // Split it by words ignoring brackets
        let words = this.title
            .replace(/[\[<{()}>\]]/g, ' ')
            .replace(/  +/g, ' ')
            .split(" ");

        // Figure release year
        this.releaseYear = 0;
        words.forEach(word => {
            const number = word - 0;
            if (word.length !== 4 || isNaN(number))
                return;

            // Within realistic release years
            if (number < 1930 || number > 2020
                // Used to catch cases such as '2012' released in 2009
                || Math.abs(2008 - number) >= Math.abs(2008 - self.releaseYear))
                return;

            self.releaseYear = number;
        });

        // Figure quality
        let rank = 99;
        this.quality = "";
        words.forEach(word => {
            if (!utils.defined(quality.mapping[word]))
                return;
            if (quality.rank(word) < rank) {
                rank = quality.rank(word);
                this.quality = quality.mapping[word];
            }
        });

        // Remove anything in brackets
        for (let i = 0, start = -1, depth = 0; i < this.title.length; i++) {
            if ('<{[('.indexOf(this.title.charAt(i)) >= 0) {
                depth++;
                start = Math.max(start, i);
            } else if (')]}>'.indexOf(this.title.charAt(i)) >= 0) {
                depth--;
                if (depth === 0 && start >= 0) {
                    this.title = `${this.title.substr(0, start)} ${this.title.substr(i + 1, this.title.length)}`;
                    i = start;
                    start = -1;
                }
            }
        }

        // Filter out release year
        if(this.releaseYear > 0)
            this.title = this.title.replace(this.releaseYear + '', wordFilter[0]);
        // Filter out known sentences not part of titles
        sentenceFilter.forEach(sentence => this.title = this.title.replace(sentence, wordFilter[0]));

        // Remove IMDB ids
        this.title = this.title.replace(/tt\d+/g, wordFilter[0]);

        // Split title into words
        words = this.title.trim().replace(/ +/g, ' ').split(" ");

        // Figure out what parts of the title is the actual movie title
        let i = 0;
        for (; i < words.length; i++)
            if (!utils.defined(wordLookup[words[i]]))
                break;
        let j = i + 1;
        for (; j < words.length; j++)
            if (utils.defined(wordLookup[words[j]]))
                break;

        if (i >= words.length) this.title = "";
        else this.title = words.slice(i, j).join(" ");

        this.title = this.title.replace(/ ?& ?/g, ' and ').replace(/[':]/g, '');
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