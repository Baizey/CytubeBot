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