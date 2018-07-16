const logger = require("../core/Logger");
const utils = require("../core/Utils");
const Api = require("../core/Api");
const socketClient = require("socket.io-client");
const exit = require("../core/Exit");
const Time = require("../core/Time");
const handlers = require("../core/Handlers");


let connecting = false;

class Connection {
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
        this.socket = null;
        this.room = room;
    }

    connect() {
        if (connecting) return;
        connecting = true;

        const self = this;
        const bot = this.bot;

        bot.validator.pause();

        const getServerUrl = async (attempt = 1) => {
            logger.system(`Connection attempt ${attempt}`);
            const request = await Api.request(`https://www.cytu.be/socketconfig/${self.room.name}.json`);
            if (request.success) {
                const serverUrl = request.result.servers.filter(server => server.secure)[0].url;
                if (!utils.isEmpty(serverUrl))
                    return connect(serverUrl);
            }
            setTimeout(() => getServerUrl(attempt + 1), 30000);
        };

        const connect = (url) => {
            logger.system(`Got server ${url}`);
            self.socket = socketClient.connect(url, {
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 60000,
                autoConnect: true,
            });

            handlers.addHandlers(bot);
            const socket = self.socket;

            socket.on('connect', () => {
                logger.debug(`Connected`);
                bot.validator.unpause();
                bot.startTime = Time.current();

                socket.emit("initChannelCallbacks");
                socket.emit("joinChannel", {name: self.room.name});
                socket.emit("login", {name: self.name, pw: self.password});
            });

            socket.on('connect_timeout', () => {
                logger.debug(`Connection timed out`);
                bot.validator.pause();
            });

            socket.on('disconnect', () => {
                logger.debug(`Disconnected`);
                bot.validator.pause();
            });
        };

        getServerUrl();
    };

    /**
     * @param {String} type
     * @param data
     */
    emit(type, data) {
        this.socket.emit(type, data);
    }

    roomPassword() {
        logger.debug("Room has password");
        const room = this.room;
        if (!utils.defined(room.password))
            exit.exit(exit.code.exit, "Have no room password to give!");
        logger.debug("Sending password...");
        this.emit("channelPassword", room.password);
    };

    userLogin(data) {
        if (!data.success)
            exit.exit(exit.code.exit, `Failed to login as ${this.name}`);
        logger.debug(`Logged in as ${data.name}`);
        this.emit("requestPlaylist");
    };
}

class Server {
    /**
     * @param {String} name
     */
    constructor(name) {
        this.name = name;
    }
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
    Connection: Connection,
    Server: Server,
    Room: Room,
};