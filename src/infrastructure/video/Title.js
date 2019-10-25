import {Quality, TitleFilter, Year} from "./TitleFilter";

export default class Title {

    static filter(fullTitle) {
        const imdbIds = fullTitle.match(/tt\d{8,}/g) || [];
        const imdb = imdbIds[0];

        // Remove imdb
        let filteredTitle = imdb ? fullTitle.replace(imdb, '') : fullTitle;
        // Sanitize
        filteredTitle = TitleFilter.sanitize(filteredTitle);
        let brackets = TitleFilter.removeBrackets(filteredTitle);
        filteredTitle = brackets.title;
        brackets = brackets.brackets;

        const bracketTokens = TitleFilter.tokenize(brackets);
        let tokens = TitleFilter.tokenize(filteredTitle);

        let quality = Quality.detect(bracketTokens);
        if (!quality) quality = Quality.detect(tokens);

        let year = Year.detect(bracketTokens);
        if (!year) year = Year.detect(tokens);

        filteredTitle =
            TitleFilter.findTitle(
                TitleFilter.tokenize(TitleFilter.filterSentences(tokens.join(' '))),
                year);

        return new Title(fullTitle, filteredTitle, year, quality, imdb);
    }

    /**
     * @param {string} full
     * @param {string} filtered
     * @param {number} year
     * @param {string} quality
     * @param {string} imdbId
     */
    constructor(full, filtered, year, quality, imdbId) {
        this.full = full;
        this.filtered = filtered;
        this.year = year;
        this.quality = quality;
        this.imdbId = imdbId;
    }

}