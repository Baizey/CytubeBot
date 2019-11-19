import DbContext from "../../src/database/sql/DbContext";
import SelectQuery from "../../src/database/sql/SelectQuery";
import InsertQuery from "../../src/database/sql/InsertQuery";
import DeleteQuery from "../../src/database/sql/DeleteQuery";
import UpdateQuery from "../../src/database/sql/UpdateQuery";
import CreateQuery from "../../src/database/sql/CreateQuery";

export default class DbContextMock extends DbContext {
    constructor() {
        super(undefined, undefined, undefined, undefined, undefined);
        this._response = [];
    }

    withResponse(data) {
        this._response = data;
    }

    async execute(sql, params = {}) {
        return this._response;
    }

    select(table) {
        return new SelectQuery(table, this);
    }

    insert(table) {
        return new InsertQuery(table, this);
    }

    delete(table) {
        return new DeleteQuery(table, this);
    }

    update(table) {
        return new UpdateQuery(table, this);
    }

    create(table) {
        return new CreateQuery(table, this);
    }
}