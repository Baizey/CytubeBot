import Poll from "../src/Services/models/Poll.js";
// noinspection ES6UnusedImports
import should from "should";

describe("Poll tests", () => {

    it('test poll title', () => {
        const poll = new Poll([], [], 'shit');
        poll.title.should.equal('shit');
    });

    it('test getting winner second', () => {
        const poll = new Poll(['a', 'b'], [1, 2], 'shit');
        poll.winner.should.equal('b');
    });

    it('test getting winner first', () => {
        const poll = new Poll(['a', 'b'], [5, 2], 'shit');
        poll.winner.should.equal('a');
    });

    it('test getting winner on tie', () => {
        const poll = new Poll(['a', 'b', 'c'], [2, 2, 1], 'shit');

        const winners = {};
        for (let i = 0; i < 100; i++)
            winners[poll.winner] = true;

        winners.should.containDeep({'a': true, 'b': true})
    });

    it('test getting closed', () => {
        const poll = new Poll(['a', 'b', 'c'], [2, 2, 1], 'shit');
        poll.close();
        poll.isActive.should.equal(false);
    });

    it('test being active', () => {
        const poll = new Poll(['a', 'b', 'c'], [2, 2, 1], 'shit');
        poll.isActive.should.equal(true);
    });

    it('test should update votes', () => {
        const poll = new Poll(['a'], [2], 'shit');
        poll.options[0].votes.should.equal(2);
        poll.update(['a'], [0]);
        poll.options[0].votes.should.equal(0);
    });
});