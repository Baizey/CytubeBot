import "regenerator-runtime";

export default class CreateQuery {
    /**
     * @param {string} table
     * @param {DbContext} context
     */
    constructor(table, context = undefined) {
        this._table = table;
        this._context = context;
        this.columns = [];
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    bool(name) {
        return this.addColumn(name, 'boolean');
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    int(name) {
        return this.addColumn(name, 'int');
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    text(name) {
        return this.addColumn(name, 'text');
    }

    /**
     * @param {string} name
     * @returns {Column}
     */
    real(name) {
        return this.addColumn(name, 'real');
    }

    /**
     * @param {string} name
     * @param {string} type
     * @returns {Column}
     */
    addColumn(name, type) {
        const column = new Column(name, type);
        this.columns.push(column);
        return column;
    }

    get generateSql() {
        const unique = this.columns.filter(e => e._isUnique);
        const primary = this.columns.filter(e => e._isPrimary);
        const multipleUnique = unique.length >= 2;
        const multiplePrimary = primary.length >= 2;
        const primaryKeys = multiplePrimary ? `,\nPRIMARY KEY (${primary.map(e => e._name).join(', ')})` : '';
        const uniqueKeys = multipleUnique ? `,\nUNIQUE (${unique.map(e => e._name).join(', ')})` : '';
        const columns = this.columns.map(e => e.generateSql(multiplePrimary, multipleUnique)).join(',\n');
        return `CREATE TABLE IF NOT EXISTS ${this._table} (${columns}${primaryKeys}${uniqueKeys})`;
    }

    /***
     * @returns {Promise<void>}
     */
    async execute() {
        await this._context.execute(this.generateSql);
    }
}

class Column {
    /**
     * @param {string} name
     * @param {string} type
     */
    constructor(name, type) {
        this._name = name;
        this._type = type;
        this._isUnique = false;
        this._isPrimary = false;
        this._isNullable = true;
        this._defaultValue = undefined;
        this._referenceValue = undefined;
    }

    /**
     * @returns {Column}
     */
    unique() {
        this._isUnique = true;
        return this;
    }

    /**
     * @param {boolean} value
     * @returns {Column}
     */
    nullable(value) {
        this._isNullable = value;
        return this;
    }

    /**
     * @param {*} value
     * @returns {Column}
     */
    default(value) {
        this._defaultValue = typeof value === 'string' ? `"${value}"` : value;
        return this;
    }

    /**
     * @returns {Column}
     */
    primary() {
        this._isPrimary = true;
        return this;
    }

    /**
     * @param {string} table
     * @param {string} column
     * @returns {Column}
     */
    reference(table, column) {
        this._referenceValue = `${table}(${column})`;
        return this;
    }

    /**
     * @param {boolean} multiPrimary
     * @param {boolean} multiUnique
     * @returns {string}
     */
    generateSql(multiPrimary = false, multiUnique = false) {
        const nullable = this._isNullable ? ''
            : ' NOT NULL';
        const def = typeof this._defaultValue === 'undefined' ? ''
            : ` DEFAULT ${this._defaultValue}`;
        const foreign = typeof this._referenceValue === 'undefined' ? ''
            : ` REFERENCES ${this._referenceValue}`;
        const unique = !this._isUnique || multiUnique ? ''
            : ` UNIQUE`;
        const primary = !this._isPrimary || multiPrimary ? ''
            : ` PRIMARY KEY`;

        return `${this._name} ${this._type}${nullable}${def}${foreign}${unique}${primary}`;
    }
}