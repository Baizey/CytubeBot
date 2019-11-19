import CytubeService from "../../src/Services/CytubeService.js";

export default class CytubeServiceMock extends CytubeService {
    constructor() {
        super(undefined, undefined);
    }

    connect() {
        return Promise.resolve();
    }

    get await() {
        return Promise.resolve();
    }

    get isConnected() {
        return true;
    }

    on(event, data) {
    }

    emit(event, data) {
    }
}