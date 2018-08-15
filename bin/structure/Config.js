class Config {
    constructor(configData) {
        this.web = new WebConfig(configData.webserver);
        this.databasePath = configData.databasePath;
        this.user = new BotUser(configData.user);
        this.channel = new Channel(configData.channel);
        this.apikeys = new ApiKeys(configData);
    }
}

class WebConfig {
    constructor(web) {
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

module.exports = Config;