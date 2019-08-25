export class WebConfig {
    constructor(web) {
        const publicWeb = web.public;
        this.password = web.password;
        this.subdomain = publicWeb.subdomain;
        this.public = publicWeb.active;
        this.active = web.active;
        this.port = web.port;
    }
}