// noinspection ES6UnusedImports
import should from "should";

import * as fs from "fs";
import Database from "../src/database/Database.js";
import Config from "../src/infrastructure/config/Config.js";
import DbContext from "../src/database/sql/DbContext.js";

const rawConfig = fs.readFileSync('./config.json').toString();
const config = new Config(JSON.parse(rawConfig));
const dbConfig = config.database;
const context = DbContext.with(dbConfig);
const database = new Database(context);

describe("Database initialization", () => {

    it("Running query", async () => {
        const users = database.users;
        await users.setup();
    });
});
