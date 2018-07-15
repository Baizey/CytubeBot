const logger = require("../core/Logger");
const utils = require("../core/Utils");
const handlers = require("../core/Handlers");
const Api = require("../core/Api");
const request = require('snekfetch');
const socketClient = require("socket.io-client");
const exit = require("../core/Exit");

let connecting = false;

class Login {
    /**
     * @param {CytubeBot} bot
     * @param {String} name
     * @param {String} password
     * @param {Boolean} useFlair
     * @param {Server} server
     * @param {Room} room
     */
    constructor(bot, name, password, useFlair, server, room) {
        this.bot = bot;
        this.name = name;
        this.password = password;
        this.useFlair = useFlair;
        this.server = server;
        this.room = room;
    }

    /**
     * @param {Number} attempts
     */
    connect(attempts = 1) {
        if (attempts === 1 && connecting)
            return;
        connecting = true;

        const self = this;
        const bot = this.bot;
        bot.validator.pause();
        self.server.close();
        const innerFunction = async () => {
            const request = Api.request(`https://www.cytu.be/socketconfig/${self.room.name}.json`);
            const resp = await request;
            if (!resp.success)
                throw "Failed getting server";
            const serverUrl = resp.result.servers.filter(server => server.secure)[0].url;
            self.server.open(bot, serverUrl, attempts);
        };
        innerFunction().catch(error => {
            logger.debug(`Connection failed (attempt ${attempts}): ${error}`);
            self.delayedConnect(attempts);
        });
    };

    delayedConnect(attempts) {
        setTimeout(() => this.connect(attempts + 1), 30000);
    };

    joinRoom() {
        const socket = this.server.socket;
        const room = this.room;
        logger.debug(`Joining room ${room.name}`);
        socket.emit("initChannelCallbacks");
        socket.emit("joinChannel", {name: room.name});
        socket.emit("login", {name: this.name, pw: this.password});
    };

    roomPassword() {
        logger.debug("Room has password");
        const room = this.room;
        const server = this.server;
        if (!utils.defined(room.password))
            exit.exit(exit.code.exit, "Have no room password to give!");
        logger.debug("Sending password...");
        server.socket.emit("channelPassword", room.password);
    };

    userLogin(data) {
        if (!data.success)
            exit.exit(exit.code.exit, `Failed to login as ${this.name}`);
        logger.debug(`Logged in as ${data.name}`);
        this.server.socket.emit("requestPlaylist");
    };
}

class Server {
    /**
     * @param {String} name
     */
    constructor(name) {
        this.name = name;
        this.socket = null;
    }
    /**
     * @param {CytubeBot} bot
     * @param {String} url
     * @param {Number} attempts
     */
    open(bot, url, attempts) {
        if (!utils.defined(url))
            throw "No connection url";
        logger.debug(`Found server (${url})`);
        this.socket = socketClient(url);
        this.socket.on('connect', () => {
            logger.debug("Connection successful!");
            handlers.addHandlers(bot);
            bot.login.joinRoom();
            bot.validator.unpause();
            connecting = false;
        });
        this.socket.on('connect_timeout', () => {
            bot.validator.pause();
            logger.debug(`Connection failed (attempt ${attempts}): connect_timeout`);
            bot.login.delayedConnect(attempts);
        });
    };

    close() {
        if (utils.defined(this.socket))
            this.socket.close();
        this.socket = null;
    };
}

class Room {
    /**
     * @param name
     * @param password
     */
    constructor(name, password) {
        this.name = name;
        this.password = password;
    }
}

module.exports = {
    BotUser: Login,
    Server: Server,
    Room: Room,
};