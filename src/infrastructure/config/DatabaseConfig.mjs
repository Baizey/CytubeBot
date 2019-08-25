export class DatabaseConfig {
    constructor(db) {
        this.host = db.host;
        this.port = db.port;
        this.database = db.database;
        this.user = db.user;
        this.password = db.password;
    }
}