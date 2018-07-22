const Connection = require("../structure/Connection").Connection;
const Room = require("../structure/Connection").Room;
const Server = require("../structure/Connection").Server;
const User = require("../structure/Message").User;
const Message = require("../structure/Message").Message;
const Validator = require("./Validator");
const Playlist = require("./Playlist");
const Patterns = require("./Pattern").Patterns;
const Library = require("./Library");
const Conversations = require("../structure/Conversations");
const Config = require("../structure/Config");
const Database = require("./Database").Database;
const utils = require("../core/Utils");
const Poll = require("./Poll").Poll;
const commands = require("../structure/CommandDictionary");
const Users = require("./Userlist");
const Time = require("../core/Time");
const logger = require("../core/Logger");
const chatLimit = utils.chatLimit;

const commandSymbols = '!$';
const isCommand = (msg) => commandSymbols.indexOf(msg.charAt(0)) >= 0;
const asExtraLine = (msg) => {
    const lastWord = msg.substr(msg.lastIndexOf(" ") + 1);
    if (lastWord.startsWith("http"))
        return `[flip]${msg} [/flip]`;
    return `[flip]${msg}[/flip]`
};
const concatMessages = (msgs) => {
    if (msgs.length <= 1)
        return msgs;
    const result = [];
    let curr = '';
    msgs.forEach(msg => {
        if(utils.isEmpty(curr))
            return (curr = msg);
        const temp = asExtraLine(msg);
        if (curr.length + temp.length <= chatLimit)
            return (curr += temp);
        result.push(curr);
        curr = msg;
    });
    if(!utils.isEmpty(curr))
        result.push(curr);
    return result;
};

class CytubeBot {
    /**
     * @param configData, json data objectified
     */
    constructor(configData) {
        this.startTime = Time.current();
        User.static.bot = this;
        const config = new Config(configData);

        // Restructuring config data
        this.apikeys = config.apikeys;
        this.connection = new Connection(
            this,
            config.userName,
            config.userPassword,
            config.useFlair,
            new Server(config.serverName),
            new Room(config.roomName, config.roomPassword));

        // Initiate structures for internal record keeping
        this.db = new Database(this, config.databasePath);
        this.validator = new Validator(this);
        this.userlist = new Users(this);
        this.patterns = new Patterns(this);
        this.conversations = new Conversations(this);
        this.poll = new Poll(this);
        this.library = new Library(this);
        this.playlist = new Playlist(this);

        // this.trivia = new Trivia();

        // Last setup part, connect to cytube
        this.connection.connect();
    }

    /**
     * @param {String|String[]} msg
     * @param {Message} receiver
     * @param {Boolean} forcePm
     */
    sendMsg(msg, receiver, forcePm = false) {
        // Split ensures we're within chat limits on each message
        // concat attempts to limit the number of messages to send
        const messages = concatMessages(utils.splitMessage(msg));
        if (utils.isEmpty(messages)) return;

        const socket = this.connection.socket;
        const pack = {meta: {}};
        const pm = receiver.isPm || forcePm;
        if (pm) pack.to = receiver.user.name;
        let type = pm ? "pm" : "chatMsg";
        logger.debug(messages);
        messages.slice(0, Math.min(3, messages.length)).forEach(message => {
            pack.msg = message;
            socket.emit(type, pack);
        });

        if(pm || messages.length <= 3)
            return;

        pack.msg = "Rest of the info will be pm'ed for the chat's sake";
        if (!pm)
            socket.emit(type, pack);

        type = "pm";
        messages.slice(3).forEach(message => {
            pack.msg = message;
            socket.emit(type, pack);
        });

    };

    /**
     * @param data
     * @param {Boolean} pm
     */
    receiveMessage(data, pm) {
        if (this.startTime.isBigger(Time.of(data.time).addSeconds(1)))
            return;

        const lowName = this.connection.name.toLowerCase();
        const lowUser = data.username.toLowerCase();
        const lowMsg = utils.htmlDecode(data.msg.trim()).toLowerCase();

        const user = new User(data.username);
        const message = new Message(utils.htmlDecode(data.msg.trim()), pm, user);

        // Ignore messages from sources we shouldn't take commands from
        if (lowUser === lowName || lowUser === "[server]")
            return logger.chat(user.name, message.isPm, message.msg);

        // Get long term info on user
        const dbUser = this.db.getUser(user);

        // Ignore user if told to
        if (utils.defined(dbUser) && dbUser.disallow)
            return logger.system(`Disallowed: ${user.name}`);

        // Ignore user if told to
        if (message.command === 'unignore') {
            this.handleCommand(message);
            return logger.command(message);
        }
        if (utils.defined(dbUser) && dbUser.ignore)
            return logger.system(`Ignoring: ${user.name}`);

        // Check if command
        if (utils.defined(message.command)) {
            // Everything is handled on Message creation

        // Check if command-pattern is made
        } else if (this.patterns.match(message)) {
            // Everything is handled inside .match

        // Check if conversation is to be kept
        } else if (lowMsg.indexOf(lowName) >= 0 || this.conversations.alive(user))
            message.command = 'talk';

        if (utils.isEmpty(message.command))
            return logger.chat(user.name, message.isPm, message.msg);

        this.handleCommand(message);
    };

    /**
     * @param {Message} message
     */
    handleCommand(message) {
        const command = commands[message.command.toLowerCase()];
        if (!utils.defined(command))
            return this.sendMsg("Unknown command... do '$help'", message);
        if (!command.hasAccess(message.user) && !message.user.hasPermission(message.command))
            return this.sendMsg("Unauthorized access, terminators has been dispatched", message);
        command.function(this, message);
    };
}

module.exports = CytubeBot;