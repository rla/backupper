const path = require('path');
const assert = require('assert');
const git = require('../tools/git');
const sanitize = require('../sanitize');

module.exports = class Git {

    constructor(address, sshPort) {
        assert.equal(typeof address, 'string');
        assert.equal(typeof sshPort, 'number');
        this.address = address;
        const match = address.match(/:(.+)$/);
        assert.ok(match, `Git address in a suitable form: ${address}.`);
        this.dest = sanitize(match[1]);
        this.sshPort = sshPort;
    }

    // Runs the backup operation.

    async execute(siteBase, pkey) {
        assert.equal(typeof siteBase, 'string');
        assert.equal(typeof pkey, 'string');
        const dest = path.join(siteBase, this.dest);
        return git.backup(this.address, pkey, dest, this.sshPort);
    }
};
