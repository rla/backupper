const path = require('path');
const assert = require('assert');
const run = require('../run');
const log = require('../log');

// Queries the currently installed rsync version.

exports.version = async () => {
    const result = await run('rsync', ['--version']);
    const match = result.stdout.toString().match(/rsync\s+version\s+(\d\.\d.\d)/);
    assert.ok(match, 'Rsync output has expected version string.');
    return match[1];
};

// Runs backup with rsync.

exports.backup = async (remote, pkey, dest, sshPort, excludes) => {
    assert.equal(typeof remote, 'string');
    assert.equal(typeof pkey, 'string');
    assert.equal(typeof dest, 'string');
    assert.equal(typeof sshPort, 'number');
    assert.ok(dest.match(/\/$/),
        `Rsync destination ${dest} must end with slash.`);
    assert.ok(Array.isArray(excludes));
    log.info(`Running rsync for ${remote}.`);
    const args = [ '-ravu', '--delete' ];
    for (const exclude of excludes) {
        args.push('--exclude');
        args.push(exclude);
    }
    args.push(remote);
    args.push(dest);
    return run('rsync', args, {
        env: {
            PKEY: pkey,
            PORT: sshPort,
            RSYNC_RSH: path.join(__dirname, 'ssh.sh')
        }
    });
};
