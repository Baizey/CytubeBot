const Column = require('./Column');

module.exports = class Table {
    constructor(name) {
        this.name = name;
        this.columns = {};
        this.primary = [];
    }

    /**
     * @returns {module.Table}
     * @param {string} name
     * @param {string} type
     * @param {string} constraints
     */
    withColumn(name, type, constraints = '') {
        this.columns[name] = new Column(name, type, constraints);
        return this;
    }

    /**
     * @param {string} column
     * @returns {module.Table}
     */
    withKey(column) {
        return this.withKeys([column]);
    }

    /**
     * @param {string[]} columns
     * @returns {module.Table}
     */
    withKeys(columns) {
        this.primary = columns.map(c => this.columns[c]);
        return this;
    }

    get whereKeys() {
        return this.primary.map(c => c.where()).join(' AND ');
    }

    get createSql() {
        return `CREATE TABLE IF NOT EXISTS ${this.name} (
            ${Object.keys(this.columns).map(e => this.columns[e]).map(e => e.sql).join(',\n')}
            ${this.primary.length === 0 ? '' : `,primary key(${this.primary.map(e => e.name).join(', ')})`}
        )`;
    }
};

