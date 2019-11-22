/**
 * @param {*} value
 * @returns {boolean}
 */
Array.prototype.contains = function (value) {
    return this.indexOf(value) >= 0;
};

/**
 * @returns {*}
 */
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
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
 * @param {function(value:T, index:int, array:T[]):T[]} func
 * @returns {T[]}
 */
Array.prototype.peek = function (func) {
    this.forEach(func);
    return this;
};

/**
 * @param {number} n
 * @returns {*[]}
 */
Array.prototype.skip = function (n) {
    return this.slice(n);
};
