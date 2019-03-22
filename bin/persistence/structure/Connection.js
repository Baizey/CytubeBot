const Query = require('./Query');
const Postgres = require('pg-promise')();

module.exports = class Connection {

    static from(config) {
        return new Connection(config.host, config.port, config.database, config.user, config.password);
    }

    constructor(host, port, database, user, password) {
        this._db = Postgres({
            host: host,
            port: port,
            database: database,
            user: user,
            password: password
        });
    }

    /**
     * @param {string} sql
     * @param {object} params
     * @returns {Promise<any[]>}
     */
    execute(sql, params = {}) {
        return this._db.any(sql, params);
    }

    /**
     * @param {string} table
     * @returns {module.Query}
     */
    select(table) {
        return new Query(this, 'select', table);
    }

    /**
     * @param {string} table
     * @returns {module.Query}
     */
    insert(table) {
        return new Query(this, 'insert', table);
    }

    /**
     * @param {string} table
     * @returns {module.Query}
     */
    delete(table) {
        return new Query(this, 'delete', table);
    }

    /**
     * @param {string} table
     * @returns {module.Query}
     */
    update(table) {
        return new Query(this, 'update', table)
    }
};