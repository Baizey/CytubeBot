import '../../infrastructure/prototype/array'

export default class Poll {
    /**
     * @param {string[]} options
     * @param {number[]|string[]} votes
     * @param {string} title
     */
    constructor(options, votes, title) {
        this.title = title;
        this.update(options, votes);
        this.isActive = true;
    }

    /**
     * @param {string[]} options
     * @param {number[]|string[]} votes
     */
    update(options, votes) {
        votes.map(vote => {
            if (typeof vote === 'number') return vote;
            vote += '';
            if (vote.length === 0 || vote === '?') return 0;
            return vote.substr(0, vote.length - 1);
        }).map(vote => vote - 0);
        this._options = options.map((e, i) => new Option(e, votes[i]));
    }

    /**
     *
     */
    close() {
        this.isActive = false;
    }

    /**
     * @returns {string}
     */
    get winner() {
        if (this._options.length === 0)
            return undefined;
        const max = Math.max(...this._options.map(e => e.votes));
        return this._options.filter(e => e.votes === max)
            .map(e => e.title).random();
    }

    /**
     * @returns {string[]}
     */
    get optionsTitles() {
        return this.options.map(e => e.title);
    }

    /**
     * @returns {Option[]}
     */
    get options() {
        return this._options;
    }
}

class Option {
    /**
     * @param {string} option
     * @param {number} votes
     */
    constructor(option, votes) {
        this.title = option;
        this.votes = votes;
    }
}