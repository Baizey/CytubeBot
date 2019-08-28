import {Query} from "./Query.js";

export class SelectQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context = undefined) {
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
     * @param {function(User|Nomination|Pattern|AliveLink|DeadLink):boolean} statement
     * @param {*} variables
     * @returns {SelectQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateSelectSql() {
        return this._columns.length === 0 ? '*' : this._columns.join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `SELECT ${this._generateSelectSql} FROM ${this._table} ${this._generateWhereSql}`;
    }

    /**
     * @returns {Promise<any[]>}
     */
    execute() {
        return super._execute(this.generateSql);
    }
}