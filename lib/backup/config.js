const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Site = require('./site');
const log = require('../log');
const exists = require('../exists');
const promisify = require('../promisify');

const mkdir = promisify(fs.mkdir);

module.exports = class Config {

    constructor(base, data) {
        assert.equal(typeof base, 'string');
        assert.equal(typeof data, 'object');
        assert.ok(data);
        this.base = base;
        this.sites = [];
        for (const key in data) {
            this.sites.push(new Site(key, data[key]));
        }
        this.error = false;
    }

    // Validates the configuration.
    // Checks that keys exist.

    async validate() {
        log.info(`Validating configuration.`);
        for (const site of this.sites) {
            await site.validate(this.base);
        }
        log.info(`Configuration validated.`);
    }

    // Validates all backup operations.
    
    async execute() {
        log.info(`Executing backup operations.`);
        const sitesBase = path.join(this.base, 'sites');
        const sitesBaseExists = await exists.directory(sitesBase);
        if (!sitesBaseExists) {
            log.info(`Creating directory ${sitesBase}.`);
            await mkdir(sitesBase);
        }
        for (const site of this.sites) {
            if (site.disabled) {
                log.info(`Skipping disabled site ${site.name}.`);
            } else {
                try {
                    await site.execute(sitesBase);
                } catch (err) {
                    log.error(`Backing up site ${site.name} failed.`);
                    log.error(err);
                    this.error = true;
                }
            }
        }
        log.info(`Executed all backup operations.`);
    }
};
