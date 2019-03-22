const Table = require('./Table');
const Column = require('./Column');

const tables = {
    permissions: {
        name: 'permissions',
        columns: {
            username: new Column('username'),
            type: new Column('type'),
        },
        primary: ['username', 'type'],
        table: new Table('permissions')
            .withColumn('username', Column.text(), `not null REFERENCES users(name)`)
            .withColumn('type', Column.text(), 'not null')
            .withKeys(['username', 'type'])
    },
    users: {
        name: 'users',
        columns: {
            name: new Column('name'),
            lastonline: new Column('lastonline'),
            disallow: new Column('disallow'),
            rank: new Column('rank'),
            ignore: new Column('ignore'),
            currency: new Column('currency'),
        },
        primary: ['name'],
        table: new Table('users')
            .withColumn('name', Column.text(), 'not null')
            .withColumn('lastonline', Column.int(), 'default 0')
            .withColumn('rank', Column.int(), 'default 0')
            .withColumn('currency', Column.number(), 'default 0')
            .withColumn('disallow', Column.bool(), 'default false')
            .withColumn('ignore', Column.bool(), 'default false')
            .withKeys(['name'])
    },
    videos: {
        name: 'videos',
        columns: {
            title: new Column('title'),
            fulltitle: new Column('fulltitle'),
            year: new Column('year'),
            duration: new Column('duration'),
            id: new Column('id'),
            type: new Column('type'),
            quality: new Column('quality'),
            validateBy: new Column('validateBy'),
        },
        primary: ['id', 'type'],
        table: new Table('videos')
            .withColumn('title', Column.text())
            .withColumn('fulltitle', Column.text())
            .withColumn('year', Column.int(), 'default 0')
            .withColumn('duration', Column.int(), 'default 0')
            .withColumn('id', Column.text(), 'not null')
            .withColumn('type', Column.text(), 'not null')
            .withColumn('quality', Column.text())
            .withColumn('validateBy', Column.int(), 'default 0')
            .withKeys(['id', 'type'])
    },
    patterns: {
        name: 'patterns',
        columns: {
            regex: new Column('regex'),
            command: new Column('command'),
            rest: new Column('rest'),
        },
        primary: [],
        table: new Table('patterns')
            .withColumn('regex', Column.text())
            .withColumn('command', Column.text())
            .withColumn('rest', Column.text())
    },
    deadlinks: {
        name: 'deadlinks',
        columns: {
            id: new Column('id'),
            type: new Column('type'),
        },
        primary: ["id", "type"],
        table: new Table('deadlinks')
            .withColumn('id', Column.text(), 'not null')
            .withColumn('type', Column.text(), 'not null')
            .withKeys(["id", "type"])
    },
    nominate: {
        name: 'nominate',
        columns: {
            username: new Column('username'),
            title: new Column('title'),
            year: new Column('year'),
        },
        primary: ["username", "title"],
        table: new Table('nominate')
            .withColumn('username', Column.text(), 'REFERENCES users(name)')
            .withColumn('title', Column.text(),'not null')
            .withColumn('year', Column.int(), 'default 0')
            .withKeys(["username", "title"])
    }
};

module.exports = tables;