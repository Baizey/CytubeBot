export class Query {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context) {
        this._table = table;
        this._context = context;
        this._where = null;
        this._whereSql = null;
        this._variables = [];
        this._parameters = {};
    }

    /**
     * @param {function(User|Nomination|Pattern|AliveLink|DeadLink):boolean} statement
     * @param {*[]} variables
     * @returns {Query}
     */
    where(statement, variables) {
        this._where = statement;
        this._variables = variables;
        this._whereSql = null;
        return this;
    }

    /**
     * @returns {string}
     */
    get _generateWhereSql() {
        if (!this._where) return '';
        if (this._whereSql) return this._whereSql;

        const str = this._where.toString();
        let row, statement;
        if (str.indexOf('=>') >= 0)
            [, row, statement] = /\s*([^\s=])\s*=>(.*)/.exec(str);
        else
            [, row, statement] = /\s*function\s*\(([^)])+\)\s*{\s*return\s*([^;}]*)\s*;?\s*}\s*/.exec(str);

        statement = statement
            .replace(/\s*&&\s*/g, ' AND ')
            .replace(/\s*\|\|\s*/g, ' OR ')
            .replace(/\s*===\s*/g, ' = ')
            .replace(/\s*!==\s*/g, ' <> ')
            .replace(/\s*==\s*/g, ' LIKE ')
            .replace(/\s*!=\s*/g, ' NOT LIKE ')
            .split(`${row}.`).join('').trim()
            .replace(/ {2,}/g, ' ');

        if (this._variables && this._variables.length > 0)
            statement = statement
                .split('$')
                .map((e, i) => {
                    const value = this._variables[i];
                    const key = `auto_param_${i}`;
                    this._parameters[key] = value;
                    return e + (this._variables[i] ? `\${${key}}` : '')
                })
                .join('');

        this._whereSql = statement ? `WHERE ${statement}` : '';
        return this._whereSql;
    }

    /***
     * @param {string} sql
     * @returns {Promise<any[]>}
     */
    _execute(sql) {
        return this._context.execute(sql, this._parameters);
    }
}

