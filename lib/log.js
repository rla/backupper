// Helper to wrap logging into stdout.
// Returning a promise allows the caller
// to wait before quick exit.

exports.info = async (message) => {
    return writeInfoLine(message);
};

exports.error = async (err) => {
    if (err) {
        const stack = err.stack;
        if (stack) {
            return writeErrorLine(stack);
        } else {
            return writeErrorLine(err);
        }
    } else {
        return writeErrorLine('Unknown error');
    }
};

const writeInfoLine = (line) => {
    return new Promise((resolve) => {
        process.stdout.write(`INFO: ${line}\n`, resolve);
    });    
};

const writeErrorLine = (line) => {
    return new Promise((resolve) => {
        process.stderr.write(`ERROR: ${line}\n`, resolve);
    });
};
