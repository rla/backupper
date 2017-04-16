#! /usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const Config = require('./lib/backup/config');
const promisify = require('./lib/promisify');
const tools = require('./lib/tools');
const log = require('./lib/log');
const tar = require('./lib/tools/tar');
const s3 = require('./lib/s3');

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const argv = yargs
    .option('base', {
        alias: 'b',
        describe: 'base directory'
    })
    .demandOption(['base'])
    .argv;

const readConfig = async (base) => {
    const configFile = path.join(base, 'config.json');
    const configData = JSON.parse(await readFile(configFile, 'utf8'));
    const config = new Config(base, configData.sites, configData.s3);
    await config.validate();
    return config;
};

const snapshot = async (base, config) => {
    const sitesDirectory = path.join(base, 'sites');
    const dateSuffix = new Date().toISOString().substring(0, 10);
    const snapshotFile = path.join(base, 'sites-' + dateSuffix + '.tgz');
    await tar.tarGzip(sitesDirectory, snapshotFile);
    await s3.upload(snapshotFile, config.s3.bucket,
        config.s3.accessKeyId, config.s3.secretAccessKey);
    return unlink(snapshotFile);
};

const run = async (base) => {
    const config = await readConfig(base);
    await tools.report();
    await config.execute();
    const dayOfMonth = new Date().getDate();
    log.info(`Current day of month is ${dayOfMonth}.`);
    log.info(`Snapshot day of month is ${config.s3.dayOfMonth}.`);
    if (dayOfMonth === config.s3.dayOfMonth) {
        log.info('Taking snapshot.');
        await snapshot(base, config);
    }
    if (config.error) {
        throw new Error('Error occurred during backup.');
    }
};

if (argv.base) {
    const base = path.resolve(argv.base);
    log.info(`Using command ${argv.command}.`);
    log.info(`Using base ${base}.`);
    run(base).catch(async (err) => {
        await log.error(err);
        process.exit(1);
    });
}
