import {DbContext} from "./database/sql/DbContext.mjs";
import * as fs from "fs";
import {Config} from "./infrastructure/config/Config.mjs";

const rawConfig = fs.readFileSync('./config.json') + '';

const config = new Config(JSON.parse(rawConfig));
const context = DbContext.with(config.database);