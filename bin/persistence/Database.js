const Connection = require('./structure/Connection');
const Tables = require('./structure/Tables');
const Time = require('../core/Time');
const Video = require("../structure/Playlist").Video;
const User = require("../structure/Message").User;
const logger = require('../core/Logger');
const Exit = require('../core/Exit');
const Response = require("../structure/Api").Response;
const utils = require('../core/Utils');
const Pattern = require("../bot/Pattern").Pattern;
const levenshtein = require("fast-levenshtein");


const handleError = error => {
    logger.error(error);
    Exit.terminate(Exit.code.crash, error);
};

const prepareQueries = connection => ({
    insertPermission: connection
        .insert(Tables.permissions.name)
        .columns(Object.keys(Tables.permissions.columns)),
    deletePermission: connection
        .delete(Tables.permissions.name)
        .where(Tables.permissions.table.whereKeys),
    getPermissions: connection
        .select(Tables.permissions.name)
        .where(Tables.permissions.columns.username.where()),
    getPermission: connection
        .select(Tables.permissions.name)
        .where(Tables.permissions.table.whereKeys),
    getVideosLikeWithYear: connection
        .select(Tables.videos.name)
        .where(Tables.videos.columns.title.where('like'))
        .where(Tables.videos.columns.year.where()),
    getVideosLike: connection
        .select(Tables.videos.name)
        .where(Tables.videos.columns.title.where('like')),
    getVideosWithYear: connection
        .select(Tables.videos.name)
        .where(Tables.videos.columns.title.where())
        .where(Tables.videos.columns.year.where()),
    getVideos: connection
        .select(Tables.videos.name)
        .where(Tables.videos.columns.title.where()),
    getVideo: connection
        .select(Tables.videos.name)
        .where(Tables.videos.table.whereKeys),
    getVideosNeedingValidation: connection
        .select(Tables.videos.name)
        .where(Tables.videos.columns.validateBy.where('>')),
    updateVideoValidateBy: connection
        .update(Tables.videos.name)
        .where(Tables.videos.table.whereKeys)
        .column(Tables.videos.columns.validateBy.name),
    insertVideo: connection
        .insert(Tables.videos.name)
        .columns(Object.keys(Tables.videos.columns)),
    deleteVideo: connection
        .delete(Tables.videos.name)
        .where(Tables.videos.table.whereKeys),

    getDead: connection
        .select(Tables.deadlinks.name)
        .where(Tables.deadlinks.table.whereKeys),
    deleteDead: connection
        .delete(Tables.deadlinks.name)
        .where(Tables.deadlinks.table.whereKeys),
    insertDead: connection
        .insert(Tables.deadlinks.name)
        .columns(Object.keys(Tables.deadlinks.columns)),

    getNomination: connection
        .select(Tables.nominate.name)
        .where(Tables.nominate.columns.username.where())
        .where(Tables.nominate.columns.title.where()),
    getNominations: connection
        .select(Tables.nominate.name)
        .where(Tables.nominate.columns.username.where('in')),
    getNominationsByUsername: connection
        .select(Tables.nominate.name)
        .where(Tables.nominate.columns.username.where()),
    insertNomination: connection
        .insert(Tables.nominate.name)
        .columns(Object.keys(Tables.nominate.columns)),
    deleteNominationsByTitle: connection
        .delete(Tables.nominate.name)
        .where(Tables.nominate.columns.title.where()),
    deleteNominationsByUsername: connection
        .delete(Tables.nominate.name)
        .where(Tables.nominate.columns.username.where()),

    getPatterns: connection
        .select(Tables.patterns.name),
    insertPattern: connection
        .insert(Tables.patterns.name)
        .columns(Object.keys(Tables.patterns.columns)),
    deletePattern: connection
        .delete(Tables.patterns.name)
        .where(Tables.patterns.columns.command.where()),

    getUsersLike: connection
        .select(Tables.users.name)
        .where(Tables.users.columns.name.where('like')),
    getUser: connection
        .select(Tables.users.name)
        .where(Tables.users.table.whereKeys),
    insertUser: connection
        .insert(Tables.users.name)
        .column(Tables.users.columns.name.name)
        .column(Tables.users.columns.rank.name),
    updateUserDisallow: connection
        .update(Tables.users.name)
        .column(Tables.users.columns.disallow.name)
        .where(Tables.users.table.whereKeys),
    updateUserLastOnline: connection
        .update(Tables.users.name)
        .column(Tables.users.columns.lastonline.name)
        .where(Tables.users.table.whereKeys),
    updateUserIgnore: connection
        .update(Tables.users.name)
        .column(Tables.users.columns.ignore.name)
        .where(Tables.users.table.whereKeys),
    updateUserRank: connection
        .update(Tables.users.name)
        .column(Tables.users.columns.rank.name)
        .where(Tables.users.table.whereKeys),
});

const constructTables = connection => {
    return new Promise(async resolve => {
        await connection.execute(Tables.users.table.createSql);
        const keys = Object.keys(Tables);
        for (let i = 0; i < keys.length; i++)
            await connection.execute(Tables[keys[i]].table.createSql);
        resolve();
    }).catch(handleError);
};

module.exports = class Database {

    /**
     * @param {DatabaseConfig} config
     */
    constructor(config) {
        const self = this;
        this._connection = new Connection(
            config.host,
            config.port,
            config.database,
            config.user,
            config.password
        );

        this._queries = prepareQueries(this.connection);

        // Prepare tables if not existing
        this._ready = false;
        constructTables(this.connection).then(() => self._ready = true);
        this._waitForReady = new Promise(async resolve => {
            while (!self._ready)
                await new Promise(wait => setTimeout(wait, 1000));
            resolve();
        });
    }

    /**
     * @returns {{deletePattern: module.Query, getPatterns, getUser, getVideo, deleteDead, insertPermission, insertPattern, insertVideo, getVideosLikeWithYear, getVideosLike, getVideosWithYear, getNominations, getPermission, getDead, deletePermission, getPermissions, getVideos, updateUserLastOnline, insertDead, insertUser, updateUserDisallow, insertNomination, getUsersLike, updateVideoValidateBy, getVideosNeedingValidation, updateUserIgnore}}
     */
    get queries() {
        return this._queries;
    }

    /**
     * @returns {module.Connection}
     */
    get connection() {
        return this._connection;
    }

    /**
     * @param {module.Query} query
     * @param {object|Array} params
     * @returns {Promise<Object[]>}
     */
    runQuery(query, params = {}) {
        /*
        if (Array.isArray(params))
            console.log(query.sql.replace(/\$(\d+)/g, (all, word) => params[word - 1] ? params[word - 1] : all));
        else
            console.log(query.sql.replace(/\$\((\w+)\)/g, (all, word) => params[word] ? params[word] : all));
        */

        if (this._ready) return query.execute(params).catch(handleError);
        return this._waitForReady
            .then(async () => await query.execute(params))
            .catch(handleError);
    }

    /**
     * @param {string} username
     * @param {string} permission
     * @returns {Promise<void>}
     */
    insertPermission(username, permission) {
        return this.runQuery(this.queries.insertPermission, {username: username, permission: permission});
    }

    /**
     * @param {string} username
     * @param {string} permission
     * @returns {Promise<void>}
     */
    deletePermission(username, permission) {
        return this.runQuery(this.queries.deletePermission, {username: username, permission: permission});
    }

    /**
     * @param {string} username
     * @returns {Promise<Object[]>}
     */
    getPermissions(username) {
        return this.runQuery(this.queries.getPermissions, {username: username});
    }

    /**
     * @param {string} username
     * @param {string} permission
     * @returns {Promise<Object>}
     */
    getPermission(username, permission) {
        return this.runQuery(this.queries.getPermission, {username: username, type: permission}).then(r => r[0]);
    }

    /**
     * @param {string} username
     * @param {string} permission
     * @returns {Promise<boolean>}
     */
    hasPermission(username, permission) {
        return this.getPermission(username, permission).then(p => !!p);
    }

    /**
     * @param {string} title
     * @param {int} year
     * @returns {Promise<Video[]>}
     */
    getVideosLike(title, year = 0) {
        const query = year ? this.queries.getVideosLikeWithYear : this.queries.getVideosLike;
        return this.runQuery(query, {title: `%${title}%`, year: year}).then(resp => resp.map(Video.fromDatabase));
    }

    /**
     * @param {string} title
     * @param {int} year
     * @returns {Promise<Video[]>}
     */
    getVideos(title, year = 0) {
        const query = year ? this.queries.getVideosWithYear : this.queries.getVideos;
        return this.runQuery(query, {title: title, year: year}).then(resp => resp.map(Video.fromDatabase));
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<Video|undefined>}
     */
    getVideo(id, type) {
        return this.runQuery(this.queries.getVideo, {id: id, type: type}).then(resp => resp.map(Video.fromDatabase)[0]);
    }

    /**
     * @param {string} id
     * @param {string} type
     * @returns {Promise<boolean>}
     */
    isVideoNeedingValidation(id, type) {
        return this.getVideo(id, type).then(video => !video || Time.current().isSmallerThan(video.validateBy));
    }

    /**
     * @param {string} id
     * @param {string} type
     * @return {*|Promise<boolean>}
     */
    hasVideo(id, type) {
        return this.getVideo(id, type).then(video => !!video);
    }

    /**
     * @returns {Promise<Video[]>}
     */
    getVideosNeedingValidation() {
        return this.runQuery(this.queries.getVideosNeedingValidation, {validateBy: Time.current().seconds})
            .then(videos => videos.map(Video.fromDatabase))
    }

    /**
     * @param {Video} video
     * @returns {Promise<void>}
     */
    updateVideoValidateBy(video) {
        return this.runQuery(this.queries.updateVideoValidateBy,
            {
                validateBy: Time.current().addDays(14, 31).addHours(0, 24).addMinutes(0, 60).seconds,
                id: video.id,
                type: video.type
            }
        );
    }

    /**
     * @param {string} username
     * @return {*|Promise<string[]>}
     */
    getNominationsByUsername(username) {
        return this.runQuery(this.queries.getNominationsByUsername, {username: username}).then(resp => resp.map(r => r.title));
    }

    /**
     * @param {string[]} users
     * @return {Promise<{title: string, year: number, votes: int}[]>}
     */
    getNominations(users) {
        if (users.length === 0) return new Promise(r => r());
        const sql = [];
        for (let i = 0; i < users.length; i++)
            sql.push(`username = $${i + 1}`);
        const query = this.connection
            .select(Tables.nominate.name)
            .where(sql.join(' OR '));

        return this.runQuery(query, users).then(resp => {
            if (resp.length === 0) return resp;

            const nominations = {};

            // Count votes
            resp.forEach(nom => {
                if (!nominations[nom.title])
                    nominations[nom.title] = {};
                if (!nominations[nom.title][nom.year])
                    nominations[nom.title][nom.year] = 0;
                nominations[nom.title][nom.year]++;
            });

            // Move votes without a year to vote for same title with year if possible
            // (if multiple, the one with most votes already)
            Object.keys(nominations).forEach(title => {
                if (!nominations[title][0])
                    return;
                const votes = nominations[title];
                const years = Object.keys(votes);
                if (years.length === 1)
                    return;
                const top = years.reduce((a, b) => (votes[a] > votes[b] || Number(b) === 0) ? a : b);
                votes[top] += votes[0];
                delete votes[0];
            });

            // Return nominations sorted by votes
            return Object.keys(nominations).map(title =>
                Object.keys(nominations[title]).map(year => ({
                    year: year - 0,
                    title: title,
                    votes: nominations[title][year]
                })))
                .reduce((x, y) => x.concat(y), [])
                .sort((a, b) => b.votes - a.votes);
        });
    }

    /**
     * @param {Message} message
     * @return {Promise<Response>}
     */
    insertNomination(message) {
        const query = {
            title: message.msg.trim(),
            year: undefined
        };

        if (query.title.length <= 1)
            return new Promise(resolve => resolve(new Response(false, 'Title is too short')));

        if (message.hasTag('year')) {
            const temp = message.getTag('year') - 0;
            if (!isNaN(temp) && isFinite(temp))
                query.year = Math.abs(Math.round(temp));
        }

        const self = this;
        return this.getVideos(query.title).then(async resp => {
            // If searched with year but no results, try without year
            if (resp.length === 0)
                resp = await self.getVideosLike(query.title);
            // If no results return failure
            if (resp.length === 0)
                return new Response(false, `Found no title like '${query.title}'`);
            // Use year if any results with it
            if (query.year) {
                const temp = resp.filter(video => video.year === query.year);
                if (temp.length > 0) resp = temp;
            }

            // Find best fitting title if multiple results
            let result = resp[0];
            if (resp.length > 1) {
                let best = Number.MAX_SAFE_INTEGER;
                for (let i = 1; i < resp.length; i++) {
                    const distance = levenshtein.get(query.title, resp[i].title);
                    if (distance < best || (distance === best && result.year < resp[i].year)) {
                        best = distance;
                        result = resp[i];
                    }
                }
            }

            // Ensures movie hasn't already been nominated by user
            const isAlreadyNominated = (await self.runQuery(self.queries.getNomination,
                {title: result.title, username: message.user.name})).length > 0;

            if (isAlreadyNominated)
                return new Response(false, `You have already nominated ${result.title}`);

            await self.runQuery(self.queries.insertNomination, {
                title: result.title,
                year: result.year,
                username: message.user.name
            });

            return new Response(true, `Your nomination of ${result.title} ${result.year ? `(${result.year})` : ''} has been accepted`);
        });
    }

    /**
     * @param {string} username
     * @return {Promise<void>}
     */
    deleteNominationsByUsername(username) {
        return this.runQuery(this.queries.deleteNominationsByUsername, {username: username});
    }

    /**
     * @param {string} title
     * @param {string[]} onlineUsers
     * @return {Promise<void>}
     */
    deleteNominationsByTitleAndOnlineUsers(title, onlineUsers) {
        if (onlineUsers.length === 0) return new Promise(r => r());
        const sql = [];
        for (let i = 0; i < onlineUsers.length; i++)
            sql.push(`username = $${i + 2}`);
        const query = this.connection
            .select(Tables.nominate.name)
            .where(sql.join(' OR '))
            .where(`title = $1`);
        onlineUsers.unshift(title);
        return this.runQuery(query, onlineUsers);
    }

    /**
     * @return {*|Promise<Pattern[]>}
     */
    getPatterns() {
        return this.runQuery(this.queries.getPatterns)
            .then(r => r.map(a => new Pattern(a.command, a.regex, a.rest)));
    }

    /**
     * @param {string} command
     * @param {string} regex
     * @param {string} rest
     * @return {Promise<void>}
     */
    insertPattern(command, regex, rest) {
        return this.runQuery(this.queries.insertPattern, {
            command: command,
            rest: rest,
            regex: regex
        });
    }

    /**
     * @param {string} command
     * @return {Promise<void>}
     */
    deletePatternByCommand(command) {
        return this.runQuery(this.queries.deletePattern, {command: command});
    }

    /**
     * @param {User} user
     * @return {Promise<object>}
     */
    getUser(user) {
        return this.getUserByName(user.name).then(resp => {
            if (resp && utils.isDefined(resp.rank))
                user.rank = resp.rank;
            return resp;
        });
    }

    /**
     * @param {string} username
     * @return {Promise<object>}
     */
    getUserByName(username) {
        return this.runQuery(this.queries.getUser, {name: username})
            .then(users => users.length > 0 ? users[0] : undefined);
    }

    /**
     * @param {string} username
     * @return {Promise<Object[]>}
     */
    getUsersLike(username) {
        return this.runQuery(this.queries.getUsersLike, {name: `%${username}%`});
    }

    /**
     * @param {User} user
     * @return {Promise<void>}
     */
    insertUser(user) {
        const self = this;
        return this.runQuery(this.queries.insertUser, {
            name: user.name,
            rank: user.rank
        }).then(async () => {
            await self.runQuery(self.queries.updateUserLastOnline, {
                name: user.name,
                lastonline: Time.current().seconds
            });
            await self.runQuery(self.queries.updateUserRank, {
                name: user.name,
                rank: user.rank
            })
        });
    }

    /**
     * @param {string} username
     * @param {boolean} value
     * @return {Promise<any> | Promise}
     */
    setDisallowUser(username, value) {
        const act = value ? 'disallowed' : 'allowed';
        const self = this;
        return this.getUserByName(username).then(user => {
            if (!user) return new Response(false, 'User does not exist');
            if (user.disallow === value) return new Response(false, `${username} is already ${act}`);
            self.runQuery(self.queries.updateUserDisallow, {
                name: username,
                disallow: value
            }).finally();
            return new Response(true, `${username} has been ${act} to contact me`);
        });
    }

    /**
     * @param {string} username
     * @param {boolean} value
     * @return {Promise<any> | Promise}
     */
    setIgnoreUser(username, value) {
        const act = value ? 'ignored' : 'unignored';
        const self = this;
        username = username.trim();
        return this.getUserByName(username).then(user => {
            if (!user) return new Response(false, 'You dont exist in my world!? contact nearest void to start existing!');
            if (user.ignore === value) return new Response(false, `You're already ${act} by me`);
            self.runQuery(self.queries.updateUserIgnore, {
                name: username,
                ignore: value
            }).finally();
            return new Response(true, `You will now be ${act} by me`);
        });
    }

    /**
     * @param {Video} video
     * @return {Promise<void>}
     */
    moveVideoToDead(video) {
        const self = this;
        return new Promise(async resolve => {
            await Promise.all([
                self.runQuery(self.queries.deleteVideo, {id: video.id, type: video.type}),
                self.runQuery(self.queries.insertDead, {id: video.id, type: video.type})
            ]);
            resolve();
        });
    }

    /**
     * @param {Video} video
     * @return {Promise<void>}
     */
    moveVideoToAlive(video) {
        const self = this;
        return new Promise(async resolve => {
            await Promise.all([
                self.runQuery(self.queries.insertVideo, video.asDatabaseObject()),
                self.runQuery(self.queries.deleteDead, {id: video.id, type: video.type}),
            ]);
            resolve();
        });
    }

    /**
     * @param {Video} video
     * @returns {Promise<boolean>}
     */
    hasDeadVideo(video) {
        return this.runQuery(this.queries.getDead, {
            id: video.id,
            type: video.type
        }).then(resp => resp.length > 0);
    }
};