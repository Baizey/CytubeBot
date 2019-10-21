import socketClient from "socket.io-client";
import {default as fetch} from 'node-fetch';
import Utils from "../infrastructure/Utils.js";

const Subscribe = {
    connect: 'connect',
    timeout: 'connect_timeout',
    disconnect: 'disconnect'
};

const Publish = {
    channelPassword: 'channelPassword',
    joinChannel: 'joinChannel',
    init: 'initChannelCallbacks',
    login: 'login',
};

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

    socket.on(Subscribe.connect, () => {
        socket.emit(Publish.init);
        socket.emit(Publish.login, {name: cytube._user.name, pw: cytube._user.password});
        socket.emit(Publish.joinChannel, {name: cytube._channel.name});
        cytube._connected = true;
    });

    socket.on(Subscribe.timeout, () => {
        cytube._connected = false;
    });

    socket.on(Subscribe.disconnect, () => {
        cytube._connected = false;
    });

    return socket;
};

/**
 * @param {CytubeService} cytube
 * @returns {Promise<Socket>}
 */
const getUrlAndConnect = async (cytube) => {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    for (let attempt = 1; true; attempt++) {
        const cytubeUrl = `https://www.cytu.be/socketconfig/${cytube._channel.name}.json`;
        const request = await fetch(cytubeUrl).then(e => e.json()).catch(() => false);
        if (request) {
            const serverUrl = request.servers.filter(server => server.secure)[0].url;
            if (serverUrl) return connect(cytube, serverUrl);
        }

        const exponent = Math.pow(attempt, 2);
        const time = Math.min(exponent * second + 5 * second, hour);
        await Utils.await(time);
    }
};


export default class CytubeService {
    /**
     * @param {Channel} channel
     * @param {BotUser} user
     */
    constructor(channel, user) {
        this._channel = channel;
        this._user = user;
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
                await Utils.await(100);
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