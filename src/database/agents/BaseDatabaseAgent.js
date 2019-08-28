export default class BaseDatabaseAgent {

    /**
     * @param {DbContext} context
     * @param {string} table
     */
    constructor(context, table) {
        this._context = context;
        this._table = table;
    }

    /**
     * @param {string[]} columns
     * @returns {SelectQuery}
     */
    select(columns = []) {
        return this._context.select(this._table).select(columns);
    }

    /**
     * @param {*} item
     * @returns {UpdateQuery}
     */
    update(item) {
        return this._context.update(this._table).update(item);
    }

    /**
     * @returns {DeleteQuery}
     */
    delete() {
        return this._context.delete(this._table);
    }

    /**
     * @param {*} item
     * @returns {InsertQuery}
     */
    insert(item) {
        return this._context.insert(this._table).insert(item);
    }

}