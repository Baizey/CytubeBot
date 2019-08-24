class Config {
    constructor(configData) {
        this.web = new WebConfig(configData.webserver);
        this.user = new BotUser(configData.user);
        this.channel = new Channel(configData.channel);
        this.apikeys = new ApiKeys(configData.apikeys);
        this.database = new DatabaseConfig(configData.database);
    }
}

class WebConfig {
    constructor(web) {
        const publicWeb = web.public;
        this.password = web.password;
        this.subdomain = publicWeb.subdomain;
        this.public = publicWeb.active;
        this.active = web.active;
        this.port = web.port;
    }
}

class Channel {
    constructor(channel) {
        this.name = channel.name;
        this.password = channel.password;
    }
}

class BotUser {
    constructor(user) {
        this.name = user.name;
        this.password = user.password;
    }
}

class ApiKeys {
    constructor(configData) {
        this.omdb = configData["OMDB"];
        this.themovieDB = configData["TheMovieDB"];
        this.weather = configData["weatherunderground"];
        this.wolfram = configData["wolfram"];
        this.google = configData["google"];
        this.cleverbot = configData["cleverbot"];
    }
}

class DatabaseConfig {
    constructor(db) {
        this.host = db.host;
        this.port = db.port;
        this.database = db.database;
        this.user = db.user;
        this.password = db.password;
    }
}

module.exports = Config;