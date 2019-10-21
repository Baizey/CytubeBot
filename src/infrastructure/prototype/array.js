/**
 * @param {*} value
 * @returns {boolean}
 */
Array.prototype.contains = function (value) {
    return this.indexOf(value) >= 0;
};

/**
 * @param {function(*):string} keyFunc
 * @param {function(*):*} valueFunc
 * @returns {object}
 */
Array.prototype.toObject = function (keyFunc = e => '' + e, valueFunc = e => true) {
    return this.reduce((obj, value) => {
        obj[keyFunc(value)] = valueFunc(value);
        return obj;
    }, {});
};

/**
 * @param {number} n
 * @returns {*[]}
 */
Array.prototype.limit = function (n) {
    return this.slice(0, n);
};

/**
 * @param {number} n
 * @returns {*[]}
 */
Array.prototype.skip = function (n) {
    return this.slice(n);
};
