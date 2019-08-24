const Postgres = require('pg-promise')();
import { Query } from './Query';

export class DbContext {
    /**
     * @param {DatabaseConfig} config
     * @returns {DbContext}
     */
    static with(config) {
        return new DbContext(config.host, config.port, config.database, config.user, config.password);
    }

    /**
     * @param {string} host
     * @param {number} port
     * @param {string} database
     * @param {string} user
     * @param {string} password
     */
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

    select(table) {
        return Query.select(table, this);
    }

    insert(table) {
        return Query.insert(table, this);
    }

    delete(table) {
        return Query.delete(table, this);
    }

    update(table) {
        return Query.update(table, this);
    }
}