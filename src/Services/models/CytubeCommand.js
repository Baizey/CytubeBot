export default class CytubeCommand {

    static fromMessage(message) {
        const tagRegex = /[\-\[](\w+)(?::(\w+))?]?/g;
        const commandRegex = /^\s*[$!](\w+)/;
        const rawCmd = commandRegex.exec(message);
        if (rawCmd) {
            const command = rawCmd[1];
            const tags = {};
            message = message.substr(rawCmd[0].length).trim().replace(tagRegex, (raw, type, value) => {
                tags[type] = value || type;
                return ''
            });
            return new CytubeCommand(command, message, tags);
        }
        return undefined;
    }

    /**
     * @param {string} name
     * @param {string} message
     * @param {object} tags
     */
    constructor(name, message, tags = {}) {
        this.message = message;
        this.name = name;
        this.tags = {
            year: tags.year || 0,
            playlist: tags.curr || tags.next || tags.prev || 'curr',
            manage: tags.manage,
            close: tags.close,
            top: tags.top,
            mine: tags.mine,
        }
    }

    /**
     * @returns {string[]}
     */
    get array() {
        return this.message.trim().split(';').filter(e => e);
    }

}