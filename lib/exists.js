const fs = require('fs');
const promisify = require('./promisify');

const fsStat = promisify(fs.stat);

exports.directory = async (directory) => {
    try {
        const stat = await fsStat(directory);
        return stat.isDirectory();
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            throw err;
        }
    }
};

exports.file = async (file) => {
    try {
        const stat = await fsStat(file);
        return stat.isFile();
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            throw err;
        }
    }
};
