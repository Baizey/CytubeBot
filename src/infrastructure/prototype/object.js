/**
 * @param {boolean} onlyOwnProperties
 * @returns {string[]}
 */
Object.prototype.keys = function (onlyOwnProperties = true) {
    return Object.keys(this).filter(e => !onlyOwnProperties || this.hasOwnProperty(e));
};

/**
 * @param {boolean} onlyOwnProperties
 * @returns {*[]}
 */
Object.prototype.values = function (onlyOwnProperties = true) {
    return this.keys(onlyOwnProperties).map(k => this[k]);
};

/**
 * @param {boolean} onlyOwnProperties
 * @returns {{value: *, key: string}[]}
 */
Object.prototype.keyValuePairs = function (onlyOwnProperties = true) {
    return this.keys(onlyOwnProperties).map(k => ({key: k, value: this[k]}));
};

/**
 * @param {function({key: string, value: *}): boolean} func
 * @returns {object}
 */
Object.prototype.filter = function (func) {
    return this.keyValuePairs()
        .filter(func)
        .toObject(e => e.key, e => e.value);
};

/**
 * @returns {object}
 */
URLSearchParams.prototype.toObject = function () {
    const entries = this.entries();
    let curr;
    const result = {};
    while (!(curr = entries.next()).done)
        result[curr.values[0]] = curr.values[1];
    return result;
};