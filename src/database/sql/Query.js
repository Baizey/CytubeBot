export class Query {

    /**
     * @param {string} table
     * @param {DbContext} context
     * @returns {SelectQuery}
     */
    static select(table, context = undefined) {
        return new SelectQuery(table, context);
    }

    /**
     * @param {string} table
     * @param {DbContext} context
     * @returns {InsertQuery}
     */
    static insert(table, context = undefined) {
        return new InsertQuery(table, context);
    }

    /**
     * @param {string} table
     * @param {DbContext} context
     * @returns {DeleteQuery}
     */
    static delete(table, context = undefined) {
        return new DeleteQuery(table, context);
    }

    /**
     * @param {string} table
     * @param {DbContext} context
     * @returns {UpdateQuery}
     */
    static update(table, context = undefined) {
        return new UpdateQuery(table, context);
    }

    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        this._table = table;
        this._context = context;
        this._where = () => false;
    }

    /**
     * @param {function(*):boolean} statement
     * @returns {Query}
     */
    filter(statement) {
        this._where = statement;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateWhereSql() {
        let [row, statement] = this._where.toString().split(/\s*=>\s*/);
        statement = statement
            .replace(/\s*&&\s*/g, ' AND ')
            .replace(/\s*\|\|\s*/g, ' OR ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            .split(`${row}.`).join('').trim()
            .replace(/ {2,}/g, ' ');
        return statement ? `WHERE ${statement}` : '';
    }
}

class SelectQuery extends Query {
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

class UpdateQuery extends Query {
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

class DeleteQuery extends Query {
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

class InsertQuery extends Query {
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