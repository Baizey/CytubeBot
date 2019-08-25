import {Channel} from "./Channel.mjs";
import {BotUser} from "./BotUser.mjs";
import {DatabaseConfig} from "./DatabaseConfig.mjs";
import {WebConfig} from "./WebConfig.mjs";
import {ApiKeys} from "./ApiKeys.mjs";

class Config {
    constructor(configData) {
        this.web = new WebConfig(configData.webserver);
        this.user = new BotUser(configData.user);
        this.channel = new Channel(configData.channel);
        this.apikeys = new ApiKeys(configData.apikeys);
        this.database = new DatabaseConfig(configData.database);
    }
}

export {Config}
export default Config;