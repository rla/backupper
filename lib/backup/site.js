const fs = require('fs');
const path = require('path');
const assert = require('assert');
const log = require('../log');
const exists = require('../exists');
const Git = require('./git');
const Rsync = require('./rsync');
const CommandScp = require('./command_scp');
const GitHub = require('./github');
const promisify = require('../promisify');

const mkdir = promisify(fs.mkdir);

module.exports = class Site {

    constructor(name, data) {
        assert.equal(typeof name, 'string');
        assert.equal(typeof data, 'object');
        assert.ok(data);
        assert.ok(name.match(/^[a-z0-9]+$/));
        this.name = name;
        const key = data.key;
        assert.equal(typeof key, 'string',
            'SSH key must be set to a file name.');
        this.key = key;
        this.sources = [];
        for (const source of data.sources) {
            if (source.disabled) {
                continue;
            }
            const type = source.type;
            const sshPort = source.ssh_port || 22;
            if (type === 'git') {
                this.sources.push(
                    new Git(source.address, sshPort));
            } else if (type === 'rsync') {
                const excludes = source.excludes || [];
                this.sources.push(
                    new Rsync(source.remote, source.dest, sshPort, excludes));
            } else if (type === 'command+scp') {                
                this.sources.push(
                    new CommandScp(source.remote, source.command, source.file, sshPort));
            } else if (type === 'github') {
                this.sources.push(
                    new GitHub(source.key));
            } else {
                throw new Error(`Invalid operation type ${type} on site ${this.name}.`);
            }
        }
        this.disabled = !!data.disabled;
    }

    // Validates the site configuration.

    async validate(base) {
        log.info(`Validating site ${this.name} configuration.`);
        assert.equal(typeof base, 'string');
        const key = path.join(base, 'keys', this.key);
        const keyExists = await exists.file(key);
        if (!keyExists) {
            throw new Error(`Site ${this.name} configured key ${this.key} does not exist.`);
        }
        log.info(`Site ${this.name} configuration is OK.`);
    }

    // Executes the site backup operations.
    
    async execute(base) {
        log.info(`Backing up site ${this.name}.`);
        assert.equal(typeof base, 'string');
        const siteBase = path.join(base, this.name);
        const siteBaseExists = await exists.directory(siteBase);
        if (!siteBaseExists) {
            await mkdir(siteBase);
            log.info(`Created directory ${siteBase}.`);
        }
        const key = path.join(base, 'keys', this.key);
        for (const source of this.sources) {
            await source.execute(siteBase, key);
        }
        log.info(`Backed up site ${this.name}.`);
    }
};
