import {Query} from "./Query.mjs";

export class SelectQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
        this._columns = [];
    }

    /**
     * @param {string[]} columns
     * @returns {SelectQuery}
     */
    select(columns) {
        this._columns = columns;
        return this;
    }

    /**
     * @param {function(row):boolean} statement
     * @returns {SelectQuery}
     */
    filter(statement) {
        super.filter(statement);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateSelectSql() {
        if (this._columns.length === 0) return '*';
        return this._columns.join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `SELECT ${this._generateSelectSql} FROM ${this._table} ${this._generateWhereSql}`;
    }

    /**
     * @param {object} parameters
     * @returns {Promise<any[]>}
     */
    execute(parameters = {}) {
        return this._context.execute(this.generateSql, parameters)
    }
}