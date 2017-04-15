const path = require('path');
const assert = require('assert');
const ssh = require('../tools/ssh');
const sanitize = require('../sanitize');

// Backup method that executes a command and then
// copies a file over SCP.

module.exports = class CommandScp {

    constructor(remote, command, file, sshPort) {
        assert.equal(typeof remote, 'string');
        assert.equal(typeof command, 'string');
        assert.equal(typeof file, 'string');
        assert.equal(typeof sshPort, 'number');
        this.remote = remote;
        this.command = command;
        this.file = file;
        this.dest = sanitize(file);
        this.sshPort = sshPort;
    }

    // Runs the backup operation.

    async execute(siteBase, pkey) {
        assert.equal(typeof siteBase, 'string');
        assert.equal(typeof pkey, 'string');        
        await ssh.command(this.remote, pkey, this.command, this.sshPort);
        const dest = path.join(siteBase, this.dest);
        return ssh.scp(this.remote + ':' + this.file, pkey, dest, this.sshPort);
    }
};
