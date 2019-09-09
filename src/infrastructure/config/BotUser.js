export class BotUser {
    /**
     * @param {{name:string, password:string}} user
     */
    constructor(user) {
        this.name = user.name;
        this.password = user.password;
    }
}