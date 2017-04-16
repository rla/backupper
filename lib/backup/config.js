const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Site = require('./site');
const log = require('../log');
const exists = require('../exists');
const promisify = require('../promisify');

const mkdir = promisify(fs.mkdir);

class S3Config {

    constructor(data) {
        assert.equal(typeof data.accessKeyId, 'string');
        assert.equal(typeof data.secretAccessKey, 'string');
        assert.equal(typeof data.bucket, 'string');
        assert.equal(typeof data.dayOfMonth, 'number');
        assert.ok(data.dayOfMonth >= 1 && data.dayOfMonth < 29,
            'Snapshot day must be between 1 and 28.');
        this.accessKeyId = data.accessKeyId;
        this.secretAccessKey = data.secretAccessKey;
        this.bucket = data.bucket;
        this.dayOfMonth = data.dayOfMonth;
    }
}

module.exports = class Config {

    constructor(base, sites, s3) {
        assert.equal(typeof base, 'string');
        assert.equal(typeof sites, 'object');
        assert.equal(typeof s3, 'object');
        assert.ok(sites);
        this.base = base;
        this.sites = [];
        for (const key in sites) {
            this.sites.push(new Site(key, sites[key]));
        }
        this.error = false;
        this.s3 = new S3Config(s3);
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
