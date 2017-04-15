const path = require('path');
const assert = require('assert');
const rsync = require('../tools/rsync');
const sanitize = require('../sanitize');

module.exports = class Rsync {

    constructor(remote, dest, sshPort, excludes) {
        assert.equal(typeof remote, 'string');
        assert.equal(typeof dest, 'string');
        assert.equal(typeof sshPort, 'number');
        assert.ok(remote.match(/\/$/),
            'Remote path must end with slash.');
        assert.ok(dest.match(/^[a-z0-9_]+$/),
            'Destination must be a simple directory name.');
        assert.ok(Array.isArray(excludes));
        this.remote = remote;
        this.dest = dest;
        this.sshPort = sshPort;
        this.excludes = excludes;
    }

    // Runs the backup operation.

    async execute(siteBase, pkey) {
        assert.equal(typeof siteBase, 'string');
        assert.equal(typeof pkey, 'string');
        const dest = path.join(siteBase, this.dest);
        return rsync.backup(this.remote, pkey, dest + '/', this.sshPort, this.excludes);
    }
};
