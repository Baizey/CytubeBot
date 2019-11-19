import CytubeService from "../../src/Services/CytubeService.js";

export default class CytubeServiceMock extends CytubeService {
    constructor() {
        super(undefined, undefined);
    }

    async connect() {
    }

    async get await() {
    }

    get isConnected() {
        return true;
    }

    on(event, data) {
    }

    emit(event, data) {
    }
}