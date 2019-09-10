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