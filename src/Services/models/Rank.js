export default class Rank {

    /**
     * @returns {Rank}
     */
    static get anon() {
        return new Rank(0);
    }

    /**
     * @returns {Rank}
     */
    static get user() {
        return new Rank(1);
    }

    /**
     * @returns {Rank}
     */
    static get mod() {
        return new Rank(2);
    }

    /**
     * @returns {Rank}
     */
    static get admin() {
        return new Rank(3);
    }

    /**
     * @returns {Rank}
     */
    static get owner() {
        return new Rank(4);
    }

    /**
     * @returns {Rank}
     */
    static get founder() {
        return new Rank(5);
    }

    /**
     * @returns {Rank}
     */
    static get dev() {
        return new Rank(6);
    }

    /**
     * @param {number} value
     */
    constructor(value) {
        this._value = value;
    }

    /**
     * @returns {string}
     */
    get name() {
        return ['anon', 'user', 'mod', 'admin', 'owner', 'founder', 'dev'][this._value];
    }

    /**
     * @returns {number}
     */
    get value() {
        return this._value;
    }

    /**
     * @param {Rank} other
     * @returns {boolean}
     */
    higherOrEqualThan(other) {
        return this._value >= other._value;
    }

    /**
     * @param {Rank} other
     * @returns {boolean}
     */
    higherThan(other) {
        return this._value > other._value;
    }
}