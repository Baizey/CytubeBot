import {Channel} from "./Channel.js";
import {BotUser} from "./BotUser.js";
import {DatabaseConfig} from "./DatabaseConfig.js";
import ApiKeys from "./ApiKeys";

export default class Config {
    constructor(configData) {
        this.user = new BotUser(configData.user);
        this.channel = new Channel(configData.channel);
        this.apikeys = new ApiKeys(configData.apikeys);
        this.database = new DatabaseConfig(configData.database);
    }
}