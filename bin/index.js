import DbContext from "../src/database/sql/DbContext.js";
import Database from "../src/database/Database.js";
import Bot from "../src/Bot/Bot.js";
import * as fs from "fs";

const config = fs.readFileSync('./config.json') + '';