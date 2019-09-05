export default class Utils {

    /**
     * Await a given time in milliseconds or until a function returns true
     * @param {number|function:boolean} time
     * @returns {Promise<void>}
     */
    static await(time = 500) {
        if (typeof time === 'number')
            return new Promise(resolve => {
                setTimeout(() => resolve(), time);
            });
        return new Promise(async resolve => {
            while (!time())
                await Utils.await(250);
            resolve();
        });
    }

}