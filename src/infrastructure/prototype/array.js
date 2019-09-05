/**
 * @param {*} value
 * @returns {boolean}
 */
Array.prototype.contains = function (value) {
    return this.indexOf(value) >= 0;
};