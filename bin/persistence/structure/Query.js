const Tables = require('./Tables');
const handleError = require('../DatabaseErrror');

module.exports = class Query {
    /**
     * @param {module.Connection} conn
     * @param {string} type
     * @param {string} table
     */
    constructor(conn, type, table) {
        this._conn = conn;
        this._type = type;
        this._table = table;
        this._limit = 0;
        this._where = [];
        this._columns = [];
        this._sql = null;
    }

    /**
     * @private
     * @returns {module.Query}
     */
    _updateSql() {
        this._sql = this._generate;
        return this;
    }

    /**
     * @param {string} where
     * @returns {module.Query}
     */
    where(where) {
        this._where.push(where);
        return this._updateSql();
    }

    /**
     * @param {string} column
     * @returns {module.Query}
     */
    column(column) {
        this._columns.push(column);
        return this._updateSql();
    }

    /**
     * @param {string[]} columns
     * @returns {module.Query}
     */
    columns(columns) {
        this._columns = columns;
        return this._updateSql();
    }

    /**
     * @param {number} limit
     * @returns {module.Query}
     */
    limit(limit) {
        this._limit = limit;
        return this._updateSql();
    }

    /**
     * @returns {string}
     */
    get sql() {
        return this._sql ? this._sql : this._updateSql()._sql;
    }

    /**
     * @returns {string}
     * @private
     */
    get _generate() {
        const where = this._where.length > 0 ? ' WHERE ' + this._where.map(w => `(${w})`).join(' AND ') : '';
        const columns = this._columns.length > 0 ? this._columns.join(', ') : '*';
        const table = this._table;
        switch (this._type) {
            case 'select':
                const selectLimit = this._limit ? ` limit ${this._limit}` : '';
                return `SELECT ${columns} FROM ${table}${where}${selectLimit}`;
            case 'insert':
                const insertColumns = this._columns.map(e => `$(${e})`).join(', ');
                return `INSERT INTO ${table} (${columns}) values (${insertColumns})`;
            case 'update':
                const updateColumns = this._columns.map(e => `${e} = $(${e})`).join(', ');
                return `UPDATE ${table} SET ${updateColumns}${where}`;
            case 'delete':
                return `DELETE FROM ${table}${where}`;
        }
    }

    /**
     * @param {object} params
     * @returns {Promise<object[]>}
     */
    execute(params = {}) {
        const query = this._conn.execute(this.sql, params);
        return this._type === 'insert'
            ? query.catch(error => error.routine.trim() === '_bt_check_unique' ? [] : handleError(error))
            : query;
    }

};