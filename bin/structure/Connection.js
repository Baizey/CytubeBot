const logger = require("../core/Logger");
const utils = require("../core/Utils");
const Api = require("../core/Api");
const socketClient = require("socket.io-client");
const Exit = require("../core/Exit");
const Time = require("../core/Time");
const handlers = require("../core/Handlers");
const Emit = require("../structure/Socket").Emit;
const On = require("../structure/Socket").On;

/**
 * @param {Connection} connection
 */
const timeoutLimiter = connection => {
    setTimeout(() => {
        if (!connection.connected)
            Exit.terminate(Exit.code.disconnect, 'No connection for more than 10 minute');
    }, Time.fromMinutes(10).millis);
};

class Connection {
    /**
     * @param {CytubeBot} bot
     * @param {Config} config
     */
    constructor(bot, config) {
        this.bot = bot;
        this.name = config.user.name;
        this.password = config.user.password;
        this.user = config.user;
        this.channel = config.channel;
        this.socket = null;
        this.connected = false;
    }

    get isConnected() {
        return utils.isDefined(this.socket);
    }

    connect() {
        const self = this;
        if (self.isConnected)
            return logger.system('Already connected');
        const bot = this.bot;

        bot.validator.pause();

        const getServerUrl = async (attempt = 1) => {
            logger.system(`Connection attempt ${attempt}`);
            const request = await Api.request(`www.cytu.be/socketconfig/${self.channel.name}.json`);
            if (request.isSuccess) {
                const serverUrl = request.result.servers.filter(server => server.secure)[0].url;
                if (utils.isUsed(serverUrl))
                    return connect(serverUrl);
            }
            setTimeout(() => getServerUrl(attempt + 1), 30000);
        };

        const connect = (url) => {
            if (self.isConnected)
                return logger.system('Already connected');
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

            socket.on(On.defaults.connect, () => {
                logger.system(`Connected`);
                bot.validator.unpause();
                bot.startTime = Time.current();

                self.emit(Emit.connect.init);
                self.emit(Emit.connect.joinChannel, {name: self.channel.name});
                self.emit(Emit.connect.login, {name: self.name, pw: self.password});
                this.connected = true;
            });

            socket.on(On.defaults.timeout, () => {
                logger.system(`Connection timed out`);
                bot.validator.pause();
                this.connected = false;
                timeoutLimiter(this);
            });

            socket.on(On.defaults.disconnect, () => {
                logger.system(`Disconnected`);
                bot.validator.pause();
                this.connected = false;
                timeoutLimiter(this);

            });
        };

        getServerUrl().catch(error => logger.error(error));
    };

    /**
     * @param {String} type
     * @param data
     */
    emit(type, data) {
        switch (type) {
            case Emit.connect.channelPassword:
            case Emit.connect.login:
                logger.debug(`EMIT | ${type} | <hidden>`);
                break;
            default:
                logger.debug(`EMIT | ${type} | ${JSON.stringify(data)}`);
        }
        this.socket.emit(type, data);
    }

    handleChannelPassword() {
        logger.system("Room has password");
        const room = this.channel;
        if (utils.isUndefined(room.password))
            Exit.terminate(Exit.code.exit, "Have no channel password to give!");
        logger.system("Sending password...");
        this.emit(Emit.connect.channelPassword, room.password);
    };

    handleUserLogin(data) {
        if (data.isFailure)
            Exit.terminate(Exit.code.exit, `Failed to login as ${this.name}`);
        logger.system(`Logged in as ${data.name}`);
        this.emit(Emit.playlist.request);
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

module.exports = Connection;