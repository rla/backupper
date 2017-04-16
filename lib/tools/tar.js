const path = require('path');
const assert = require('assert');
const run = require('../run');
const log = require('../log');

// Queries the currently installed tar version.

exports.version = async () => {
    const result = await run('tar', ['--version']);
    return result.stdout.toString().split(/\r?\n/)[0];
};

// Creates gzipped tar from the given
// directory.

exports.tarGzip = async (directory, dest) => {
    assert.equal(typeof directory, 'string');
    assert.equal(typeof dest, 'string');
    log.info(`Running tar for ${directory}.`);
    const result = await run('tar', [ '-czf', dest, directory ]);
    log.info(`Finished running tar for ${directory}.`);
    return result;
};
