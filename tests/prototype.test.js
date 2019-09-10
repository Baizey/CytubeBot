// noinspection ES6UnusedImports
import should from "should";
import "../src/infrastructure/prototype/array.js";
import "../src/infrastructure/prototype/string.js";

describe("Prototype tests", () => {

    describe('array', () => {
        it("contains", () => {
            [1].contains(1).should.true();
        });
        it("not contains", () => {
            [1].contains(2).should.false();
        });
        it("not contains", () => {
            [1].contains('1').should.false();
        });
        it("toObject", () => {
           [1,2].toObject(e => e + '', e => e)
               .should.deepEqual({
               1: 1,
               2: 2,
           })
        });
    });

    describe('string', () => {
        it("htmlEncode", () => {
            '&'.htmlEncode().should.equal('&#x26;');
        });
        it("htmlDecode", () => {
            '&#x26;'.htmlDecode().should.equal('&');
        });
    });
});