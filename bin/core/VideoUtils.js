const Video = require("../structure/Playlist").Video;

const wordFilter = [
    "super 720p",
    "full sci fi",
    "full animation",
    "sci fi",
    "nonton film",
    "nonton movie",
    "web dl",
    "full original",
    "silent movie",
    "eng dub",
    "english sub",
    "watch full movie",
    "full movie",
    "copy of the",
    "copy of",
    "ultimate edition",
    "full hd",
    "in hq",
    "movie online",
    "anniversary edition",
    "saphirebluray",
    "h264",
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

        // Remove any urls
        this.title = fullTitle.replace(/(^| )(https?:\/\/)?(www\.)?.*?\.(com|org|net)( |$)/g, ' ').trim();

        this.title = this.title.replace(/[.,_~/\\\-]/g, ' ').trim().replace(/ +/g, ' ').toLowerCase();

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

        // Filter out known words to be non-title words
        words = this.title.trim().replace(/ +/g, ' ').split(" ");

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
    }
}

const VideoUtils = {
    Movie: MovieInfo,
};

module.exports = VideoUtils;