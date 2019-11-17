export default class BaseDatabaseAgent {

    /**
     * @param {DbContext} context
     * @param {CreateQuery} createQuery
     */
    constructor(context, createQuery) {
        this._context = context;
        this._table = createQuery._table;
        this._create = createQuery;
    }

    /**
     * @returns {Promise<void>}
     */
    setup() {
        return this._create.execute();
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
        const primary = this._create.primaryKeys;
        const data = item.filter(e => !primary.contains(e.key));
        return this._context.update(this._table).update(data);
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