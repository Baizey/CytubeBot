export default class DeadLink {

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
        this.id = id;
        this.type = type;
    }
}