const fs = require('fs');
const path = require('path');
const assert = require('assert');
const run = require('../run');
const log = require('../log');
const exists = require('../exists');

// Queries the currently installed SSH version.

exports.version = async () => {
    const result = await run('git', ['--version']);
    return result.stdout.toString().trim();
};

// Clones the given repository.

const clone = exports.clone = async (address, pkey, dest, sshPort) => {
    assert.equal(typeof address, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof sshPort, 'number');
    assert.ok(validAddress(address));
    log.info(`Cloning repository at ${address}.`);
    return run('git', [
        'clone',
        address,
        dest
    ], {
        env: {
            PKEY: pkey,
            PORT: sshPort,
            GIT_SSH: path.join(__dirname, 'ssh.sh')
        }
    });
};

// Pulls the master branch.

const pullMaster = exports.pullMaster = async (pkey, dest, sshPort) => {
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof sshPort, 'number');
    log.info(`Pulling repository at ${dest}.`);
    return run('git', [
        'pull',
        'origin',
        'master'
    ], {
        cwd: dest,
        env: {
            PKEY: pkey,
            PORT: sshPort,
            GIT_SSH: path.join(__dirname, 'ssh.sh')
        }
    });
};

// Clones or pulls the master depending
// whether the repository exists or not.

exports.backup = async (address, pkey, dest, sshPort) => {
    log.info(`Backing up repository at ${address}.`);
    const existing = await exists.directory(dest);
    if (existing) {
        return pullMaster(pkey, dest, sshPort);
    } else {
        return clone(address, pkey, dest, sshPort);
    }
};

// Checks that the given repository address is valid.
// Currently accepts SSH adrdesses only.

const validAddress = (address) => {
    return !!address.match(/^[^@]+@[^@]+:[^@]+$/);
};
