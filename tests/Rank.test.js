// noinspection ES6UnusedImports
import should from "should";
import Rank from "../src/Services/models/Rank.js";

describe("Rank tests", () => {
    const ranks = [Rank.founder, Rank.owner, Rank.admin, Rank.mod, Rank.user, Rank.anon];
    const names = ['founder', 'owner', 'admin', 'mod', 'user', 'anon'];
    const values = [5, 4, 3, 2, 1, 0];

    describe('Rank creations', () => {
        for (let i = 0; i < ranks.length; i++)
            it(`${ranks[i].name} is called ${names[i]}`, () => {
                ranks[i].name.should.equal(names[i]);
            });
        for (let i = 0; i < ranks.length; i++)
            it(`${ranks[i].name} is valued ${values[i]}`, () => {
                ranks[i].value.should.equal(values[i]);
            });
    });

    describe('HigherThan', () => {
        for (let i = 0; i < ranks.length; i++)
            for (let j = i + 1; j < ranks.length; j++)
                it(`${ranks[i].name} is higher than ${ranks[j].name}`, () => {
                    ranks[i].higherThan(ranks[j]).should.equal(true);
                });

        for (let i = 0; i < ranks.length; i++)
            for (let j = i; j < ranks.length; j++)
                it(`${ranks[j].name} is lower or equal ${ranks[i].name}`, () => {
                    ranks[j].higherThan(ranks[i]).should.equal(false);
                });
    });

    describe('HigherOrEqualThan', () => {
        for (let i = 0; i < ranks.length; i++)
            for (let j = i; j < ranks.length; j++)
                it(`${ranks[i].name} is higher or equal ${ranks[j].name}`, () => {
                    ranks[i].higherOrEqualThan(ranks[j]).should.equal(true);
                });

        for (let i = 0; i < ranks.length; i++)
            for (let j = i + 1; j < ranks.length; j++)
                it(`${ranks[j].name} is lower than ${ranks[i].name}`, () => {
                    ranks[j].higherOrEqualThan(ranks[i]).should.equal(false);
                });
    });

});