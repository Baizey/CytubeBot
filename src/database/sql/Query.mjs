export class Query {
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

