import {Query} from "./Query.js";

export class InsertQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context = undefined) {
        super(table, context);
    }

    /**
     * @param {object} columns
     * @returns {InsertQuery}
     */
    insert(columns) {
        this._parameters = {...this._parameters, ...columns};
        this._columns = columns;
        return this;
    }

    /**
     * @param {function(User|Nomination|Pattern|AliveLink|DeadLink):boolean} statement
     * @param {*} variables
     * @returns {InsertQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateInsertKeysSql() {
        return Object.keys(this._columns).join(', ');
    }

    /**
     * @returns {string}
     */
    get _generateInsertValuesSql() {
        return Object.keys(this._columns).map(key => `\${${key}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        const keys = this._generateInsertKeysSql;
        const values = this._generateInsertValuesSql;
        return `INSERT INTO ${this._table} (${keys}) values (${values})`;
    }

    /**
     * @returns {Promise<any[]>}
     */
    execute() {
        return super._execute(this.generateSql);
    }
}