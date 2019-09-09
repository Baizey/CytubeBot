import DatabaseLink from "./DatabaseLink.js";

export default class DeadLink extends DatabaseLink {

    /**
     * @param {object} link
     * @returns {DeadLink}
     */
    static fromDatabase(link) {
        return link ? new DeadLink(link.id, link.type) : undefined;
    }

    /**
     * @param {string} id
     * @param {string} type
     */
    constructor(id, type) {
        super(id, type);
    }
}