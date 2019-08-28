import {Channel} from "./Channel.js";
import {BotUser} from "./BotUser.js";
import {DatabaseConfig} from "./DatabaseConfig.js";
import {WebConfig} from "./WebConfig.js";
import {ApiKeys} from "./ApiKeys.js";

export default class Config {
    constructor(configData) {
        this.web = new WebConfig(configData.webserver);
        this.user = new BotUser(configData.user);
        this.channel = new Channel(configData.channel);
        this.apikeys = new ApiKeys(configData.apikeys);
        this.database = new DatabaseConfig(configData.database);
    }
}