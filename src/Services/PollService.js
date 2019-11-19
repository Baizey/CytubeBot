import Poll from "./models/Poll.js";

const Subscriptions = {
    update: 'updatePoll',
    close: 'closePoll',
    open: 'newPoll'
};

const Publishers = {
    close: 'closePoll',
    open: 'newPoll'
};

export default class PollService {
    /**
     * @param {CytubeService} cytube
     */
    constructor(cytube) {
        this._cytube = cytube;
        this.current = new Poll([], [], 'None');
    }

    subscribe() {
        const self = this;
        this._cytube.on(Subscriptions.open,
            /**
             * @param {{counts: number[], options: string[], title:string}} data
             */
            data => self.current = new Poll(data.options, data.counts, data.title));

        this._cytube.on(Subscriptions.update,
            /**
             * @param {{counts: number[], options: string[]}} data
             */
            data => self.current.update(data.options, data.counts));

        this._cytube.on(Subscriptions.close,
            /**
             * @param {null} data
             */
            data => self.current.close());
    }

    /**
     * @param {String} title
     * @param {String[]} options
     * @param {Boolean} obscured
     */
    open(title, options, obscured) {
        this._cytube.emit(Publishers.open, {
            title: title,
            obscured: obscured,
            opts: options
        });
        this.current = new Poll(options,
            '0'.repeat(options.length).split('').map(e => e - 0),
            title);
    }

    /**
     * @returns {string}
     */
    closeAndChooseWinner() {
        const winner = this.current.winner;
        this.close();
        return winner;
    }

    close() {
        this._cytube.emit(Publishers.close);
    }
}

