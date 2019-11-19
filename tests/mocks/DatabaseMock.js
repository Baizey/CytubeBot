import Database from "../../src/database/Database";
import DbContextMock from "./DbContextMock";

export default class DatabaseMock extends Database {
    /**
     * @param {DbContextMock} context
     */
    constructor(context) {
        super(context);
    }

    async setup() {
    }
}