import {Query} from "./Query.mjs";

export class UpdateQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
    }

    /**
     * @param {object} columns
     * @returns {UpdateQuery}
     */
    map(columns) {
        this._columns = columns;
        return this;
    }

    /**
     * @param {function(row):boolean} statement
     * @returns {UpdateQuery}
     */
    filter(statement) {
        super.filter(statement);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateUpdateSql() {
        return Object.keys(this._columns).map(e => `${e} = \${${this._columns[e]}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `UPDATE ${this._table} SET ${this._generateUpdateSql} ${this._generateWhereSql}`;
    }

    /**
     * @param {object} parameters
     * @returns {Promise<any[]>}
     */
    execute(parameters = {}) {
        return this._context.execute(this.generateSql, parameters)
    }
}