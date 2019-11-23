import * as fs from "fs";
import Database from "./database/Database.js";
import CytubeService from "./Services/CytubeService.js";
import Bot from "./Bot/Bot.js";
import Config from "./infrastructure/config/Config.js";
import DbContext from "./database/sql/DbContext.js";
import CleverbotAgent from "./agents/CleverbotAgent";
import PastebinAgent from "./agents/PastebinAgent";
import UrbanDictionaryAgent from "./agents/UrbanDictionaryAgent";
import TmdbAgent from "./agents/TmdbAgent";
import OmdbAgent from "./agents/OmdbAgent";
import YoutubeAgent from "./agents/YoutubeAgent";
import GiphyAgent from "./agents/GiphyAgent";

const rawConfig = fs.readFileSync('./config.json').toString();

const config = new Config(JSON.parse(rawConfig));
const context = DbContext.with(config.database);
const cytube = new CytubeService(config.channel, config.user);
const database = new Database(context);

const apiKeys = config.apikeys;

const pastebin = new PastebinAgent(apiKeys.pastebin);
const urbanDictionary = new UrbanDictionaryAgent();
const chatbot = new CleverbotAgent(apiKeys.cleverbot);
const tmdb = new TmdbAgent(apiKeys.themovieDB);
const omdb = new OmdbAgent(apiKeys.omdb);
const youtube = new YoutubeAgent(apiKeys.google);
const giphy = new GiphyAgent(apiKeys.giphy);

const apis = {
    pastebin: pastebin,
    urbanDictionary: urbanDictionary,
    chatbot: chatbot,
    tmdb: tmdb,
    omdb: omdb,
    youtube: youtube,
    giphy: giphy
};

const bot = new Bot(
    config.user.name,
    apis,
    cytube,
    database
);