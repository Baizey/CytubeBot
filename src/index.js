import * as fs from "fs";
import Database from "./database/Database.js";
import CytubeService from "./Services/CytubeService.js";
import Bot from "./Bot/Bot.js";
import Config from "./infrastructure/config/Config.js";
import DbContext from "./database/sql/DbContext.js";

const rawConfig = fs.readFileSync('./config.json') + '';

const config = new Config(JSON.parse(rawConfig));
const context = DbContext.with(config.database);
const cytube = new CytubeService(config);
const database = new Database(context);

const bot = new Bot(config, cytube, database);