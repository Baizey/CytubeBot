const join = require("path").join;
const paths = require('../core/Logger').paths;
const loggers = require('../core/Logger').logs;
const App = require('express');
const Http = require('http');
const Io = require('socket.io');
const utils = require('../core/Utils');
const reader = require('read-last-lines');

const colors = {
    chat: '#9ACD32',
    commands: 'lightblue',
    debug: '#D3B53D',
    system: 'teal',
    error: '#a00000',
    shutdown: '#F00000 '
};

const createLogLine = (name, status, color, text) => `<span name="${name}" style="color:${color}; display: ${status ? 'block' : 'none'}">${utils.htmlEncode(text)}</span>`;

class WebServer {

    /**
     * @param {CytubeBot} bot
     * @param {WebConfig} webServer
     */
    constructor(bot, webServer) {
        if (!webServer.active)
            return;

        const   app = App(),
                http = Http.Server(app),
                io = Io(http);

        this.connections = {};
        Object.keys(loggers).forEach(key => loggers[key].on('line', line => this.emit(key, line)));

        http.listen(webServer.port);
        app.get('/', (req, res) => res.sendFile(join(__dirname, '.', `index.html`)));
        io.on('connection', socket => {
            const filterStatus = {
                chat: true,
                commands: true,
                system: true,
                debug: true,
                error: true,
                shutdown: true
            };
            const uid = this.register(socket, filterStatus);

            /**
             * @param {{name: string, display: boolean}} data
             */
            socket.on('filter', data => filterStatus[data.name] = data.display);
            socket.on('disconnect', () => this.unregister(uid));

            const init = async () => {
                let logs = Object.keys(paths).map(key => ({
                    lines: reader.read(paths[key], 50).catch(() => ''),
                    name: key,
                    color: utils.isDefined(colors[key]) ? colors[key] : 'black'
                }));

                for(let i = 0; i < logs.length; i++)
                    logs[i].lines = (await logs[i].lines).trim().split(/\n/);

                const lines = [];
                logs.forEach(log => {
                    log.lines.forEach(line => {
                        const index = line.match(/\[([^\]]+)]/);
                        lines.push({
                            index: utils.isUsed(index) ? index[1] : 'Z',
                            html: createLogLine(log.name, filterStatus[log.name], log.color, line)
                        });
                    });
                });
                lines.sort((a, b) => (a.index > b.index) ? 1 : ((a.index < b.index) ? -1 : 0))
                    .forEach(line => socket.emit('display', line.html));
            };
            init().catch(error => {throw error});
        });
    }

    emit(logname, line) {
        Object.keys(this.connections).forEach(uid => {
            const conn = this.connections[uid];
            if (utils.isUndefined(conn)) return;
            conn.socket.emit('display', createLogLine(logname, conn.filter[logname], colors[logname], line))
        })
    }

    /**
     * @param {Socket} socket
     * @param {object} filter
     * @returns {number}
     */
    register(socket, filter) {
        let uid = Date.now();
        while(utils.isDefined(this.connections[uid]))
            uid += 'a';
        this.connections[uid] = {
            socket: socket,
            filter: filter
        };
        return uid;
    }

    /**
     * @param {number} uid
     */
    unregister(uid) {
        delete this.connections[uid];
    }

}

module.exports = WebServer;