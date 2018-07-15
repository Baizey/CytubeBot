class Config {
    constructor(configData) {
        this.databasePath = configData.databasePath;
        this.userName = configData.userName;
        this.userPassword = configData.userPassword;
        this.useFlair = configData.useFlair;
        this.serverName = configData.serverName;
        this.roomName = configData.roomName;
        this.roomPassword = configData.roomPassword;
        this.apikeys = new ApiKeys(configData);
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