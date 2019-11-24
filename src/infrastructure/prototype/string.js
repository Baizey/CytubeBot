import * as html from "html-encoder-decoder";

const htmlDefault = html.default;

/**
 * @returns {string}
 */
String.prototype.capitalize = function () {
    return this.length > 0
        ? this.charAt(0).toUpperCase() + this.substr(1)
        : this;
};

/**
 * @returns {boolean}
 */
String.prototype.contains = function (otherString) {
    return this.indexOf(otherString) >= 0;
};

/**
 * @returns {string}
 */
String.prototype.htmlDecode = function () {
    return htmlDefault.decode(this);
};

/**
 * @returns {string}
 */
String.prototype.htmlEncode = function () {
    return htmlDefault.encode(this);
};