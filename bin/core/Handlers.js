const logger = require("./Logger");
const User = require("../structure/Message").User;
const Option = require("../bot/Poll").Option;
const Video = require("../structure/Playlist").Video;
const Time = require("../core/Time");
const utils = require("../core/Utils");

const addHandlers = function (bot) {
    const library = bot.library;
    const userlist = bot.userlist;
    const playlist = bot.playlist;
    const poll = bot.poll;
    const socket = bot.connection.socket;

    // TODO: Add structures for incoming data so what they contain isn't magic

    // Listening types:
    // Responders   : We have to emit a respond
    // Passive      : Data updateEvent from server
    // Reactors     : We are getting a respond to something we emitted

    // Playlist PASSIVE (reactors, if we're the ones to moveEvent/delete/updateEvent media)
    let lastPlaylist = Time.of().addSeconds(30);
    socket.on("playlist", (videos) => {
        if(lastPlaylist.isBigger(Time.current()))
            return logger.debug("Ignoring playlist...");
        logger.debug("Getting playlist...");
        lastPlaylist = Time.current().addSeconds(30);
        playlist.setPlaylist(videos.map(video => Video.fromCytube(video)));
    });
    socket.on("mediaUpdate", (data) => playlist.updateCurrentMedia(data.currentTime, data.paused));
    socket.on("changeMedia", (data) => playlist.changeMedia(data.currentTime, Video.fromCytube(data)));
    socket.on("setCurrent", (id) => playlist.updateMedia(id));
    socket.on("moveVideo", (data) => playlist.moveEvent(data.from, data.after)); // id's
    socket.on("setTemp", (data) => playlist.setTemp(data.uid, data.temp));
    socket.on("delete", (data) => playlist.removeEvent(data.uid));
    socket.on("setLeader", (data) => playlist.setLeader(data.name)); // "" = none
    socket.on("queue", (data) => {
        const video = Video.fromCytube(data.item);
        playlist.addEvent(data.after, video);
        bot.db.insertVideo(video);
    }); // after is id

    // Poll PASSIVE
    socket.on("updatePoll", (data) => {
        const options = [];
        // Handle anon polls...
        const count = data.counts[0];
        if (!utils.isEmpty(count) && typeof count === 'string' && count.slice(-1) === '?')
                data.counts = data.counts.map(c => c.substr(0, c.length - 1) - 0);

        for(let i in data.options)
            options.push(new Option(data.options[i], data.counts[i]))
        poll.updateEvent(options);
    });
    socket.on("newPoll", (data) => {
        // const creator = data.initiator;
        // Handle anon polls...
        const count = data.counts[0];
        if (!utils.isEmpty(count) && typeof count === 'string' && count.slice(-1) === '?')
                data.counts = data.counts.map(c => c.substr(0, c.length - 1) - 0);

        const options = [];
        for(let i in data.options)
            options.push(new Option(data.options[i], data.counts[i]))
        poll.openEvent(options);
    });
    socket.on("closePoll", (data) => poll.closeEvent());


    // Userlist PASSIVE (reactors, if we use mod-commands like kick)
    socket.on("addUser",        (data) => userlist.add(new User(data.name, data.rank)));
    socket.on("setUserRank",    (data) => userlist.updateRank(new User(data.name, data.rank)));
    socket.on("userLeave",      (data) => userlist.remove(new User(data.name)));
    socket.on("userlist",       (data) => userlist.setUsers(
        Object.keys(data).map(key => new User(data[key].name, data[key].rank))
    ));

    // Login
    // REACTOR, we initiated this by attempting to connection
    socket.on("connection",          (data) => bot.connection.userLogin(data));
    // RESPONDER, we need to respond with a password
    socket.on("needPassword",   (data) => bot.connection.roomPassword(data));

    // Messages PASSIVE
    socket.on("pm",             (data) => bot.receiveMessage(data, true));
    socket.on("chatMsg",        (data) => bot.receiveMessage(data, false));

    // Library search results
    // REACTOR, we initiated this by sending a search query
    socket.on("searchResults", (data) =>
        library.handleResults(data.results.map(video => Video.fromCytube(video))));

    // Handle mixed stuff, PASSIVE
    socket.on("error", (err) => logger.error(err));

    /* Unused listeners
    socket.on("disconnect",     (data) => {});
    socket.on("setPlaylistMeta", (data) => {});
    socket.on("emoteList", (emotes) => {});
    socket.on("removeEmote", (emote) => {});
    socket.on("updateEmote", (data) => {});
    socket.on("usercount", (data) => {});
    socket.on("drink", (data) => {});
    */
};

exports.addHandlers = addHandlers;
