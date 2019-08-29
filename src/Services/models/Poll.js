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
        votes.map(vote => ((typeof vote) !== 'number') ? vote.match(/\d+/)[0] : vote).map(vote => vote - 0);
        this.options = options.map((e, i) => new Option(e, votes[i]));
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
        if (this.options.length === 0)
            return undefined;
        const max = Math.max(...this.options.map(e => e.votes));
        const winners = this.options.filter(e => e.votes === max);
        const pick = Math.floor(Math.random() * winners.length);
        return winners[pick].title;
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