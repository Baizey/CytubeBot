import Query from "./Query.js";


export default class DeleteQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context = undefined) {
        super(table, context);
    }

    /**
     * @param {function(User|Nomination|Pattern|AliveLink|DeadLink):boolean} statement
     * @param {*} variables
     * @returns {DeleteQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `DELETE FROM ${this._table} ${this._generateWhereSql}`;
    }

    /**
     * @returns {Promise<any[]>}
     */
    execute() {
        return super._execute(this.generateSql);
    }
}