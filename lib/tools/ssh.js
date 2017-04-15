const path = require('path');
const assert = require('assert');
const run = require('../run');
const log = require('../log');

// Queries the currently installed SSH version.

exports.version = async () => {
    const result = await run('ssh', ['-V']);
    return result.stderr.toString().trim();
};

// Prepares the ssh.sh wrapper to be used by
// other tools.

exports.prepare = async () => {
    return run('chmod', ['+x', path.join(__dirname, 'ssh.sh')]);
};

// Executes remote command over SSH.

exports.command = async (address, pkey, command, sshPort) => {
    assert.equal(typeof address, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof command, 'string');
    assert.equal(typeof sshPort, 'number');
    log.info(`Executing remote command on ${address}.`);
    return run('ssh', [
        '-p', sshPort,
        '-i', pkey,
        address,
        command
    ]);
    log.info(`Finished executing the remote command on ${address}.`);
};

// Copies a remote file using SCP.

exports.scp = async (remote, pkey, dest, sshPort) => {
    assert.equal(typeof remote, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof sshPort, 'number');
    log.info(`Copying remote file ${remote}.`);
    return run('scp', [
        '-P', sshPort,
        '-i', pkey,
        remote,
        dest
    ]);
    log.info(`Finished copying file ${remote}.`);
};
