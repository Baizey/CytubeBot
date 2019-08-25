import {InsertQuery} from "./InsertQuery.mjs";
import {DeleteQuery} from "./DeleteQuery.mjs";
import {UpdateQuery} from "./UpdateQuery.mjs";
import {SelectQuery} from "./SelectQuery.mjs";

import * as tempPostgres from 'pg-promise';
const Postgres = tempPostgres();

class DbContext {
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
        return new SelectQuery(table, this);
    }

    insert(table) {
        return new InsertQuery(table, this);
    }

    delete(table) {
        return new DeleteQuery(table, this);
    }

    update(table) {
        return new UpdateQuery(table, this);
    }
}

export {DbContext}
export default DbContext;