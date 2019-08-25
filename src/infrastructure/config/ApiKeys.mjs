export class ApiKeys {
    constructor(configData) {
        this.omdb = configData["OMDB"];
        this.themovieDB = configData["TheMovieDB"];
        this.weather = configData["weatherunderground"];
        this.wolfram = configData["wolfram"];
        this.google = configData["google"];
        this.cleverbot = configData["cleverbot"];
    }
}