const join = require("path").join;
const logger = require('../core/Logger');
const fs = require('fs');
const paths = logger.paths;
const loggers = logger.logs;
const App = require('express');
const Http = require('http');
const Io = require('socket.io');
const utils = require('../core/Utils');
const Time = require('../core/Time');
const reader = require('read-last-lines');
const Tunnel = require('localtunnel');

const colors = {
    chat: '#9ACD32',
    commands: 'lightblue',
    debug: '#D3B53D',
    system: 'teal',
    error: '#a00000',
    shutdown: '#F00000 '
};

const splitLogLine = /^\[([^\]]+)\] (.*)$/;

const createLogLine = (name, status, color, text) => {
    text = ['chat', 'commands'].indexOf(name) >= 0 ? text : utils.htmlEncode(text);
    return splitLogLine.test(text)
        ? `<span name="${name}" data-time="${new Date(text.match(splitLogLine)[1]).getTime()}" style="color:${color}; display: ${status ? 'block' : 'none'}">${text}</span>`
        : '';
};

class WebServer {

    /**
     * @param {CytubeBot} bot
     * @param {WebConfig} webServer
     */
    constructor(bot, webServer) {
        const self = this;
        if (!webServer.active)
            return;

        this.logs = [];
        const init = async () => {
            let logs = Object.keys(paths).map(key => ({
                lines: reader.read(paths[key], 1000).catch(() => ''),
                name: key,
                color: utils.isDefined(colors[key]) ? colors[key] : 'black'
            }));

            for(let i = 0; i < logs.length; i++)
                logs[i].lines = (await logs[i].lines).trim().split(/\n/);

            const lines = [];
            logs.forEach(log => {
                log.lines.forEach(line => {
                    const index = line.match(splitLogLine);
                    lines.push({
                        index: utils.isUsed(index) ? index[1] : 'Z',
                        html: createLogLine(log.name, true, log.color, line)
                    });
                });
            });
            self.logs = lines.sort((a, b) => (a.index > b.index) ? 1 : ((a.index < b.index) ? -1 : 0)).map(line => line.html)
                .concat(self.logs);
            self.emit('logs', self.logs);
        };
        init().catch(error => {throw error});


        this.tunnel = null;
        if (webServer.public) {
            const openTunnel = (attempts = 1) => {
                logger.system(`Opening localtunnel, attempt ${attempts}`);

                self.tunnel = Tunnel(webServer.port, {subdomain: webServer.subdomain}, error => {
                    if (utils.isEmpty(error))
                        return;
                    logger.error(`LocalTunnel: ${error}`);
                    self.tunnel.close();
                    setTimeout(() => openTunnel(attempts + 1), Time.fromMinutes(1).millis);
                });

                self.tunnel.on('error', error => {
                    logger.error(`LocalTunnel: ${error}`);
                    self.tunnel.close();
                });

                //this.tunnel.on('request', request => logger.debug(request));

                let closed = false;
                self.tunnel.on('close', () => {
                    if (closed) return;
                    closed = true;
                    logger.system('LocalTunnel is closed');
                    setTimeout(() => openTunnel(), Time.fromMinutes(1).millis);
                });
            };
            openTunnel();
        }

        const app = App(), http = Http.Server(app), io = Io(http);

        this.connections = {};
        Object.keys(loggers).forEach(key => loggers[key].on('line', line => this.sendNewLine(key, line)));

        http.listen(webServer.port);
        app.get('/', (req, res) => res.sendFile(join(__dirname, '.', `index.html`)));
        io.on('connection', socket => {
            logger.system('Someone connected to web server');
            socket.on('login', password => {
                if (webServer.password !== password) {
                    logger.system(`User was wrong with ${password}`);
                    socket.emit('login', false);
                    socket.disconnect();
                    return;
                }

                socket.emit('login', true);

                logger.system('User logged in');
                socket.emit('clear');
                const filterStatus = {
                    chat: true,
                    commands: true,
                    system: true,
                    debug: true,
                    error: true,
                    shutdown: true
                };
                socket.on('filter', data => filterStatus[data.name] = data.display);
                setTimeout(() => {
                    socket.emit('logs', self.logs);
                    setTimeout(() => {
                        const uid = self.register(socket, filterStatus);
                        socket.on('disconnect', () => self.unregister(uid));
                    }, 1000)
                }, 1000);
            });
        });
    }

    emit(type, data) {
        Object.keys(this.connections).forEach(uid => {
            const conn = this.connections[uid];
            if (utils.isUndefined(conn)) return;
            conn.socket.emit(type, data);
        });
    }

    sendNewLine(logname, line) {
        this.logs.push(createLogLine(logname, true, colors[logname], line));
        while (this.logs.length > 20000)
            this.logs.shift();

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