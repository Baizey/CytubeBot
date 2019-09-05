import * as html from "html-encoder-decoder";

/**
 * @returns {string}
 */
String.prototype.htmlDecode = function () {
    return html.decode(this);
};

/**
 * @returns {string}
 */
String.prototype.htmlEncode = function () {
    return html.encode(this);
};