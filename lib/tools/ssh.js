const fs = require('fs');
const path = require('path');
const assert = require('assert');
const run = require('../run');
const log = require('../log');
const promisify = require('../promisify');

const fsStat = promisify(fs.stat);

// Queries the currently installed SSH version.

exports.version = async () => {
    const result = await run('ssh', ['-V']);
    return result.stderr.toString().trim();
};

// Prepares the ssh.sh wrapper to be used by
// other tools.

exports.prepare = async () => {
    const script = path.join(__dirname, 'ssh.sh');
    const stat = await fsStat(script);
    const mode = stat.mode;
    if (mode & parseInt('0001', 8) ||
        mode & parseInt('0010', 8) ||
        mode & parseInt('0100', 8)) {
        // Already executable.
        return;
    } else {
        log.info(`Making ssh.sh executable.`);
        return run('chmod', ['+x', script]);
    }
};

// Executes remote command over SSH.

exports.command = async (address, pkey, command, sshPort) => {
    assert.equal(typeof address, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof command, 'string');
    assert.equal(typeof sshPort, 'number');
    log.info(`Executing remote command on ${address}.`);
    const result = await run('ssh', [
        '-p', sshPort,
        '-i', pkey,
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'StrictHostKeyChecking=no',
        address,
        command
    ]);
    log.info(`Finished executing the remote command on ${address}.`);
    return result;
};

// Copies a remote file using SCP.

exports.scp = async (remote, pkey, dest, sshPort) => {
    assert.equal(typeof remote, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof sshPort, 'number');
    log.info(`Copying remote file ${remote}.`);
    const result = await run('scp', [
        '-P', sshPort,
        '-i', pkey,
        '-o', 'UserKnownHostsFile=/dev/null',
        '-o', 'StrictHostKeyChecking=no',
        remote,
        dest
    ]);
    log.info(`Finished copying file ${remote}.`);
    return result;
};
