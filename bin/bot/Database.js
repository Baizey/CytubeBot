const SQlite = require("better-sqlite3");
const utils = require("../core/Utils");
const logger = require("../core/Logger");
const Pattern = require("./Pattern").Pattern;
const Table = require("../structure/Database").Table;
const Column = require("../structure/Database").Column;
const structure = require("../structure/Database").structure;
const Video = require("../structure/Playlist").Video;
const Time = require("../core/Time");
const Response = require("../structure/Api").Response;


class Database {

    /**
     * @param {CytubeBot} bot
     * @param {String} pathToDb
     */
    constructor(bot, pathToDb) {
        this.bot = bot;
        this.structure = structure;
        const self = this;
        this.db = new SQlite(pathToDb);

        Object.keys(structure).forEach(key => {
            const table = structure[key].table;
            self.db.prepare(`CREATE TABLE IF NOT EXISTS ${table.name} (${table.getColumns()})`).run();
        });
    }


    /*
     * PERMISSION FUNCTIONS
     */
    /**
     * @param {User} user
     * @param {String} permission
     */
    insertPermission(user, permission) {
        const table = structure.permissions.table;
        const columns = structure.permissions.columns;
        this.prepareInsert(table.name, `${columns.user.name}, ${columns.type.name}`, "?, ?").run(user.name, permission);
    }
    /**
     * @param {User} user
     * @param {String} permission
     */
    deletePermission(user, permission) {
        const table = structure.permissions.table;
        const columns = structure.permissions.columns;
        this.prepareDelete(table.name, `${columns.user.where()}, ${columns.type.where()}`).run(user.name, permission);
    }

    /**
     * @param {User} user
     * @returns {String[]}
     */
    getPermissions(user) {
        const table = structure.permissions.table;
        const columns = structure.permissions.columns;
        console.log(user.name);
        return this.prepareSelect(table.name, columns.user.where()).all(user.name)
            .filter(item => utils.defined(item))
            .map(permission => permission[columns.type.name]);
    }
    /**
     * @param {User} user
     * @param {String} permission
     * @returns {Boolean}
     */
    hasPermission(user, permission) {
        const table = structure.permissions.table;
        const columns = structure.permissions.columns;
        return utils.defined(this.prepareSelect(table.name, `${columns.user.where()}, ${columns.type.where()}`).get(user.name, permission));
    }

    /*
     * VIDEO FUNCTIONS
     */
    /**
     * @param {String} title
     * @param {Number} year
     * @returns {Video[]}
     */
    getVideosLike(title, year) {
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        if (year === 0)
            return this.prepareSelect(table.name, `${columns.title.like()}`)
                .all(`%${title}%`).map(v => Video.fromDatabase(v));
        return this.prepareSelect(table.name, `${columns.title.like()} AND ${columns.year.where()}`)
            .all(`%${title}%`, year).map(v => Video.fromDatabase(v));
    };

    /**
     * @param {Video} video
     * @returns {Video[]}
     */
    getVideo(video) {
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        if (video.year === 0)
            return this.prepareSelect(table.name, `${columns.title.where()}`)
                .all(video.title).map(v => Video.fromDatabase(v));
        return this.prepareSelect(table.name, `${columns.title.where()} AND ${columns.year.where()}`)
            .all(video.title, video.year).map(v => Video.fromDatabase(v));
    };

    /**
     * @param {String} title
     * @returns {Video[]}
     */
    getVideosByTitle(title) {
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        return this.prepareSelect(table.name, `${columns.title.where()}`)
            .all(title.trim())
            .map(e => Video.fromDatabase(e));
    }

    /**
     * @param {Video} video
     * @returns {Video|null}
     */
    getVideoExact(video) {
        const table = structure.videos.table;
        const result = this.prepareSelect(table.name, table.keysWhere()).get(video.id, video.type);
        if (utils.defined(result))
            return Video.fromDatabase(result);
        return null;
    };

    /**
     * @returns {Video[]}
     */
    getVideosNeedingValidation() {
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        const result = this.prepareSelect(table.name, `${columns.validateBy.name} > ?`)
            .all(Time.current().seconds);
        if (!utils.defined(result))
            return [];
        return result.map(video => Video.fromDatabase(video));
    };

    /**
     * @param {Video} video
     */
    updateValidationBy(video) {
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        const time = Time.current()
            .addDays(14, 31)
            .addHours(0, 24)
            .addMinutes(0, 60)
            .seconds;
        this.prepareUpdate(table.name, columns.validateBy.name, table.keysWhere())
            .run(time, video.id, video.type);
    };

    /**
     * @param {Video} video
     */
    insertVideo(video) {
        if (!utils.defined(video) || video.isIntermission())
            return;
        const table = structure.videos.table;
        const columns = structure.videos.columns;
        this.prepareInsert(table.name,
            `${columns.title.name}, ${columns.fulltitle.name}, ${columns.year.name}, ${columns.id.name}, ${columns.type.name}, ${columns.quality.name}, ${columns.duration.name}`,
            table.getInsert()
        ).run(video.title, video.fullTitle, video.year, video.id, video.type, video.quality, video.time.seconds);
        this.updateValidationBy(video);
    };

    /*
     * NOMINATION FUNCTIONS
     */
    /**
     * @param {String[]} users
     * @returns {*|Object[]}
     */
    getNominations(users) {
        const table = structure.nominate.table;
        const c = structure.nominate.columns;
        const nominations = this.prepareSelect(table.name, `${c.user.name} in (${users.map(n => `'${n}'`).join(', ')})`).all();

        if(utils.isEmpty(nominations))
            return [];

        const map = {};
        nominations.forEach(nom => {
            const key = `${nom.year > 0 ? `${Math.round(nom.year)} - ` : ''}${nom.title.charAt(0).toUpperCase() + nom.title.substr(1)}`;
            if (!utils.defined(map[key])) {
                nom.votes = 0;
                nom.key = key;
                map[key] = nom;
            }
            map[key].votes++;
        });

        const result = utils.mapToList(map);
        result.sort((a, b) => {
            if(b.votes === a.votes)
                return b.year - a.year;
            return b.votes - a.votes
        });

        for (let i = 0; i < result.length; i++) {
            if (result[i].year === 0)
                continue;
            for(let j = i + 1; j < result.length; j++) {
                if (result[j].year > 0 || result[i].title !== result[j].title)
                    continue;
                result[i].votes += result[j].votes;
                result.splice(j, 1);
                j--;
            }
        }

        result.sort((a, b) => b.votes - a.votes);
        return result;
    }

    /**
     * @param {Message} message
     * @returns {Response}
     */
    insertNomination(message) {
        const videos = this.structure.videos;
        const nominate = this.structure.nominate;

        if (message.array.length === 0)
            return new Response(false, 'Need a movie title');
        const videoTitle = message.array[0].toLowerCase();
        const videoYear = message.array.length > 1 && !isNaN(message.array[1]) ? message.array[1] - 0 : 0;

        let results = this.getVideosByTitle(videoTitle);
        if (utils.isEmpty(results))
            return new Response(false, 'No movies with that title, please be exact, do $avail title to make sure we got it');

        if (videoYear !== 0 && results.filter(v => v.year === videoYear).length === 0)
            return new Response(false, `Found ${results.length} movies, but none with matching release year :(`);

        const c = nominate.columns;

        // You can only nominate multiple of the same titled movies if they have years specified
        const previousNominations = this.prepareSelect(nominate.table.name, `${c.user.where()} AND ${c.title.where()}`)
            .all(message.user.name, videoTitle);
        if (previousNominations.length > 0 && videoYear === 0)
            return new Response(false, 'You have already nominated this title');
        else if (videoYear > 0 && !previousNominations.every(e => e.year !== 0))
            return new Response(false, 'You have already nominated this title');

        this.prepareInsert(nominate.table.name,
            `${c.title.name}, ${c.user.name}, ${c.year.name}`,
            nominate.table.getInsert())
            .run(videoTitle, message.user.name, videoYear);

        return new Response(true, 'Your nomination has been accepted');
    }


    /*
     * PATTERN FUNCTIONS
     */
    getPatterns() {
        const result = this.prepareSelect(structure.patterns.table.name).all();
        if (!utils.defined(result))
            return [];
        return result.map(p => new Pattern(p.command, p.regex, p.rest));
    };

    insertPattern(command, regex, rest) {
        const table = structure.patterns.table;
        const columns = structure.patterns.columns;
        this.prepareInsert(table.name,
            `${columns.command.name}, ${columns.regex.name}, ${columns.rest.name}`, table.getInsert())
            .run(command, regex, rest);
    };

    deletePattern(command) {
        const table = structure.patterns.table;
        const columns = structure.patterns.columns;
        this.prepareDelete(table.name, columns.command.where()).run(command);
    };

    /*
     * USERS FUNCTIONS
     */
    /**
     * @param {String} name
     */
    getUsers(name) {
        const table = structure.users.table;
        const columns = structure.users.columns;
        return this.prepareSelect(table.name, columns.name.like()).all(`%${name}%`);
    };

    /**
     * @param {User} user
     */
    getUser(user) {
        const table = structure.users.table;
        const columns = structure.users.columns;
        const result = this.prepareSelect(table.name, columns.name.where())
            .get(user.name);
        if (utils.defined(result))
            user.rank = result.rank;
        return result;
    };

    /**
     * @param {User} user
     */
    insertUser(user) {
        const table = structure.users.table;
        const columns = structure.users.columns;
        this.prepareInsert(table.name, columns.name.name, table.getInsert())
            .run(user.name);
        this.prepareUpdate(table.name, columns.lastonline.name, columns.name.where())
            .run(Time.current().seconds, user.name);
        this.prepareUpdate(table.name, columns.rank.name, columns.name.where())
            .run(user.rank, user.name);
    };

    /**
     * @param {Number} value
     * @param {CytubeBot} bot
     * @param {Message} message
     * @returns {Boolean}
     */
    setDisallowUser(value, bot, message) {
        const table = structure.users.table;
        const columns = structure.users.columns;
        const victim = message.msg.trim();
        const resp = bot.userlist.hasHigherRank(message.user, victim);
        if (resp.success)
            this.prepareUpdate(table.name, columns.disallow.name, columns.name.where())
                .run(value, victim);
        bot.sendMsg(resp.result, message);
        return resp.success;
    }

    /**
     * @param {Number} value
     * @param {CytubeBot} bot
     * @param {Message} message
     * @returns {Boolean}
     */
    setIgnoreUser(value, bot, message) {
        const table = structure.users.table;
        const columns = structure.users.columns;
        const victim = message.msg.trim();
        this.prepareUpdate(table.name, columns.ignore.name, columns.name.where())
            .run(value, victim);
    }

    /*
     * DEADLINKS FUNCTIONS
     */
    /**
     * @param {Video} video
     */
    moveToDead(video) {
        const videos = structure.videos.table;
        const dead = structure.deadlinks.table;
        const dc = structure.deadlinks.columns;
        this.prepareDelete(videos.name, videos.keysWhere()).run(video.id, video.type);
        this.prepareInsert(dead.name, `${dc.id.name}, ${dc.type.name}`, dead.getInsert()).run(video.id, video.type);
    };

    /**
     * @param {Video} video
     */
    moveToAlive(video){
        const dead = structure.deadlinks.table;
        this.prepareDelete(dead.name, dead.keysWhere()).run(video.id, video.type);
        this.insertVideo(video);
    }

    /**
     * @param {Video} video
     * @returns {Boolean}
     */
    isDead(video) {
        const dead = structure.deadlinks.table;
        return utils.defined(this.prepareSelect(dead.name, dead.keysWhere()).get(video.id, video.type));
    };

    /*
     *Prepare statement functions
     */
    prepareSelect(table, where = null) {
        let sql = `SELECT * FROM ${table}`;
        if (utils.defined(where))
            sql += ` WHERE ${where}`;
        return this.prepare(sql);
    };

    prepareMultiUpdate(table, columns, where = null) {
        let sql = `UPDATE ${table} SET ${columns}`;
        if (utils.defined(where))
            sql += ` WHERE ${where}`;
        return this.prepare(sql);
    };

    prepareUpdate(table, column, where = null) {
        let sql = `UPDATE ${table} SET ${column} = ?`;
        if (utils.defined(where))
            sql += ` WHERE ${where}`;
        return this.prepare(sql);
    };

    prepareInsert(table, columns, values) {
        return this.prepare(`INSERT OR IGNORE INTO ${table} (${columns}) VALUES (${values})`);
    };

    prepareDelete(table, where = null) {
        let sql = `DELETE FROM ${table}`;
        if (utils.defined(where))
            sql += ` WHERE ${where}`;
        return this.prepare(sql);
    };

    prepare(sql) {
        logger.debug(sql);
        return this.db.prepare(sql);
    }
}

module.exports = {
    Database: Database,
    structure: structure
};