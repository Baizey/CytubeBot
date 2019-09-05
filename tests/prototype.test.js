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