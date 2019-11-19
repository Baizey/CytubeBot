export default class CytubeCommand {

    static fromMessage(message) {
        const tagRegex = /-\s*(\w+)(?::(\w+))?/g;
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
        this.rawTags = tags;
        this.tags = {
            source: tags.youtube || tags.yt || 'library',
            year: tags.year || tags.y || 0,
            playlist: tags.next || tags.prev || 'curr',
            manage: tags.manage || tags.m,
            close: tags.close || tags.c,
            delete: tags.delete || tags.d,
            all: tags.all || tags.a,
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