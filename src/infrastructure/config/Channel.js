class Channel {
    /**
     * @param {{name:string, password:string}} channel
     */
    constructor(channel) {
        this.name = channel.name;
        this.password = channel.password;
    }
}

export {Channel}
export default Channel;
