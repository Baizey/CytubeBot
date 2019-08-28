import Link from "./Link.js";

export default class DeadLink extends Link {

    /**
     * @param {object} link
     * @returns {DeadLink}
     */
    static fromDatabase(link) {
        return link ? new DeadLink(link.id, link.type) : null;
    }

    /**
     * @param {string} id
     * @param {string} type
     */
    constructor(id, type) {
        super(id, type);
    }
}