// Helper to promisify a Node-styled async function.

module.exports = (fn) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            args.push((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
            fn.apply(null, args);
        });
    };
};
