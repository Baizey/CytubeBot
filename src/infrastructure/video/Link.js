/**
 * @param {String} id
 * @param {String} type
 * @returns {string}
 */
function uniteLink(id, type) {
    switch (type) {
        case "gd":
            return `https://docs.google.com/file/d/${id}/edit`;
        case "yt":
            return `https://youtube.com/watch?v=${id}`;
        case "vi":
            return `https://vimeo.com/${id}`;
        case "dm":
            return `https://dailymotion.com/video/${id}`;
    }
}

export default class Link {

    /**
     * @param {string} url
     * @returns {Link}
     */
    static fromUrl(url) {
        if (!url) return undefined;
        const host = url.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
        switch (host) {
            case 'docs.google.com':
            case 'drive.google.com':
                return new Link(url.split('file/d/', 2)[1].split(/[\/?#]/, 1)[0], 'gd');
            case 'searchyoutube.com':
            case 'youtube.com':
                return new Link(url.split('watch?v=', 2)[1].split(/[?&#]/)[0], 'yt');
            case 'vimeo.com':
                return new Link(url.split('vimeo.com/', 2)[1].split(/[?&#]/)[0], 'vi');
            case 'dailymotion.com':
                return new Link(url.split('/video/', 2)[1].split(/[?&#]/)[0], 'dm');
        }
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Link}
     */
    static fromIdAndType(id, type) {
        if (uniteLink(id, type))
            return new Link(id, type);
    }

    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.url = uniteLink(id, type);
    }

}