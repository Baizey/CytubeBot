import InsertQuery from "./InsertQuery.js";
import DeleteQuery from "./DeleteQuery.js";
import UpdateQuery from "./UpdateQuery.js";
import SelectQuery from "./SelectQuery.js";
import CreateQuery from "./CreateQuery.js";
import '../../infrastructure/prototype/object.js';
import '../../infrastructure/prototype/array.js';
import Logger from '../../infrastructure/logger/Logger.js';

import * as pg from 'pg';

export default class DbContext {
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
     * @param {string} username
     * @param {string} password
     */
    constructor(host, port, database, username, password) {
        // Actually pg.Pool but that didnt work so fuck it, here we are
        this._connection = pg.default.Pool({
            host: host,
            port: port,
            database: database,
            user: username,
            password: password
        });
    }

    /**
     * Shitty work-around since pg-promise with named parameters broke
     * We're manually reworking it to work here with $1, $2 etc for normal pg
     * @param {string} sql
     * @param {object} params
     * @returns {Promise<*>}
     */
    async execute(sql, params = {}) {
        const values = [];
        sql = sql.replace(/\${([^}]+)}/g, (raw, key) => {
            values.push(params[key]);
            return '$' + values.length;
        });

        const client = await this._connection.connect();
        const resp = await client.query({
            text: sql,
            values: values
        });
        client.release();

        return resp.rows;
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

    create(table) {
        return new CreateQuery(table, this);
    }
}