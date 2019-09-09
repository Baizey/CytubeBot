import * as html from "html-encoder-decoder";
const htmlDefault = html.default;

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