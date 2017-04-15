const assert = require('assert');
const spawn = require('child_process').spawn;

// Runs the process. Captures output.

module.exports = (binary, args, options) => {
    return new Promise((resolve, reject) => {
        assert.equal(typeof binary, 'string');
        assert(Array.isArray(args));
        const proc = spawn(binary, args, options);
        let stdout = Buffer.alloc(0);
        let stderr = Buffer.alloc(0);
        proc.stdout.on('data', (buffer) => {
            stdout = Buffer.concat([stdout, buffer]);
        });
        proc.stderr.on('data', (buffer) => {
            stderr = Buffer.concat([stderr, buffer]);
        });
        proc.on('close', (code) => {
            const result = { stdout, stderr, code };
            if (code === 0) {
                resolve(result);
            } else {
                const error = new Error(`Executing ${binary} failed.`);
                error.stderr = stderr.toString();
                error.code = code;
                reject(error);
            }
        });
        proc.on('error', (err) => {
            reject(err);
        });
    });
};
