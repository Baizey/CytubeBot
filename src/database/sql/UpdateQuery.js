import Query from "./Query.js";

export default class UpdateQuery extends Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context = undefined) {
        super(table, context);
    }

    /**
     * @param {object} columns
     * @returns {UpdateQuery}
     */
    update(columns) {
        this._parameters = {...this._parameters, ...columns};
        this._columns = columns;
        return this;
    }

    /**
     * @param {function(DatabaseUser|Nomination|DatabasePattern|AliveLink|DeadLink):boolean} statement
     * @param {*} variables
     * @returns {UpdateQuery}
     */
    where(statement, ...variables) {
        super.where(statement, variables);
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateUpdateSql() {
        return Object.keys(this._columns).map(key => `${key} = \${${key}}`).join(', ');
    }

    /**
     * @returns {string}
     */
    get generateSql() {
        return `UPDATE ${this._table} SET ${this._generateUpdateSql} ${this._generateWhereSql}`;
    }

    /**
     * @returns {Promise<any[]>}
     */
    execute() {
        return super._execute(this.generateSql);
    }
}