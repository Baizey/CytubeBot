const On = {
    actions: {
        kicked: 'kick'
    },
    defaults: {
        connect: 'connect',
        timeout: 'connect_timeout',
        disconnect: 'disconnect'
    },
    playlist: {
        get: 'playlist',
        update: 'mediaUpdate',
        change: 'changeMedia',
        setCurrent: 'setCurrent',
        move: 'moveVideo',
        setTemp: 'setTemp',
        setLeader: 'setLeader',
        delete: 'delete',
        queue: 'queue',
    },
    poll: {
        update: 'updatePoll',
        close: 'closePoll',
        open: 'newPoll'
    },
    userlist: {
        add: 'addUser',
        setRank: 'setUserRank',
        leave: 'userLeave',
        get: 'userlist'
    },
    connect: {
        connection: 'connection',
        needPassword: 'needPassword'
    },
    chat: {
        pm: 'pm',
        public: 'chatMsg'
    },
    library: {
        searchResults: 'searchResults'
    },
    error: {
        unknown: 'error',
        queue: 'queueFail'
    }
};
const Emit = {
    playlist: {
        queue: 'queue',
        jumpTo: 'jumpTo',
        request: 'requestPlaylist',
        delete: 'delete'
    },
    connect: {
        channelPassword: 'channelPassword',
        joinChannel: 'joinChannel',
        init: 'initChannelCallbacks',
        login: 'login',
    },
    chat: {
        pm : 'pm',
        public: 'chatMsg'
    },
    poll: {
        close: 'closePoll',
        open: 'newPoll'
    },
    library: {
        search: 'searchMedia'
    }
};
module.exports = {
    On: On,
    Emit: Emit
};