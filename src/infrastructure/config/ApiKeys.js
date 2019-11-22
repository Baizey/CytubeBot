export default class ApiKeys {
    constructor(configData = {}) {
        this.omdb = configData['OMDB'] || '';
        this.themovieDB = configData['TheMovieDB'] || '';
        this.giphy = configData['giphy'] || '';
        this.wolfram = configData['wolfram'] || '';
        this.google = configData['google'] || '';
        this.cleverbot = configData['cleverbot'] || '';
        this.pastebin = configData['pastebin'] || '';
    }
}