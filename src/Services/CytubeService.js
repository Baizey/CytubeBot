import socketClient from "socket.io-client";
import {default as fetch} from 'node-fetch';

/**
 * @param {CytubeService} cytube
 * @param {string} url
 * @returns {Socket}
 */
const connect = (cytube, url) => {
    const socket = socketClient.connect(url, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 60000,
        autoConnect: true,
    });

    socket.on(On.defaults.connect, () => {
        cytube.emit(Emit.connect.init);
        cytube.emit(Emit.connect.joinChannel, {name: cytube._channel.name});
        cytube.emit(Emit.connect.login, {name: cytube._user.name, pw: cytube._user.password});
        cytube._connected = true;
    });

    socket.on(On.defaults.timeout, () => {
        cytube._connected = false;
    });

    socket.on(On.defaults.disconnect, () => {
        cytube._connected = false;
    });

    return socket;
};

/**
 * @param cytube
 * @param attempt
 * @returns {Promise<Socket>}
 */
const getUrlAndConnect = async (cytube, attempt = 1) => {
    const cytubeUrl = `https://www.cytu.be/socketconfig/${cytube._channel.name}.json`;
    const request = await fetch(cytubeUrl).then(e => e.json()).catch(() => false);
    if (request) {
        const serverUrl = request.servers.filter(server => server.secure)[0].url;
        if (serverUrl) return connect(cytube, serverUrl);
    }
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const exponent = Math.pow(attempt, 2);
    setTimeout(() => getUrlAndConnect(attempt + 1), Math.min(exponent * second + 5 * second, hour));
};


export default class CytubeService {
    /**
     * @param {Config} config
     */
    constructor(config) {
        this._channel = config.channel;
        this._user = config.user;
        this._connected = false;
        this._socket = undefined;
    }

    async connect() {
        this._socket = await getUrlAndConnect(this);
    }

    /**
     * @returns {boolean}
     */
    get isConnected() {
        return !!(this._connected && this._socket);
    }

    /**
     * @returns {Promise<void>}
     */
    get await() {
        if (this.isConnected) return Promise.resolve();
        return new Promise(async resolve => {
            while (!this.isConnected)
                await new Promise(r => setTimeout(() => r(), 5000));
            resolve();
        });
    }

    /**
     * @param {String} event
     * @param {*} data
     */
    emit(event, data = undefined) {
        if (this.isConnected)
            this._socket.emit(event, data);
    }

    /**
     * @param {string} event
     * @param {function(*):*} act
     */
    on(event, act) {
        this.await.finally(() => this._socket.on(event, data => act(data)));
    }
}