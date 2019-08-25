import {Query} from "./Query.mjs";

export class InsertQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
    }

    /**
     * @param {object} columns
     * @returns {InsertQuery}
     */
    insert(columns) {
        this._columns = columns;
        return this;
    }

    /**
     * @param {function(row):boolean} statement
     * @returns {InsertQuery}
     */
    filter(statement) {
        super.filter(statement);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateInsertColumnsSql() {
        return Object.keys(this._columns).join(', ');
    }

    /**
     * @returns {string}
     */
    get _generateInsertValuesSql() {
        return Object.keys(this._columns).map(e => `\${${this._columns[e]}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `INSERT INTO ${this._table} (${this._generateInsertColumnsSql}) values (${this._generateInsertValuesSql})`;
    }

    /**
     * @param {object} parameters
     * @returns {Promise<any[]>}
     */
    execute(parameters = {}) {
        return this._context.execute(this.generateSql, parameters)
    }
}