import {Query} from "./Query.mjs";


export class DeleteQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        super(table, context);
    }

    /**
     * @param {function(row):boolean} statement
     * @returns {DeleteQuery}
     */
    filter(statement) {
        super.filter(statement);
        return this;
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `DELETE FROM ${this._table} ${this._generateWhereSql}`;
    }

    /**
     * @param {object} parameters
     * @returns {Promise<any[]>}
     */
    execute(parameters = {}) {
        return this._context.execute(this.generateSql, parameters)
    }
}