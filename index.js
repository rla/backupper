const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const Config = require('./lib/backup/config');
const promisify = require('./lib/promisify');
const tools = require('./lib/tools');
const log = require('./lib/log');

const readFile = promisify(fs.readFile);

const argv = yargs
    .option('command', {
        alias: 'c',
        describe: 'command to execute',
        choices: ['backup', 'snapshot']
    })
    .option('base', {
        alias: 'b',
        describe: 'base directory'
    })
    .demandOption(['command', 'base'])
    .argv;

if (argv.command && argv.base) {
    const base = path.resolve(argv.base);
    log.info(`Using command ${argv.command}.`);
    log.info(`Using base ${base}.`);

    const configFile = path.join(base, 'config.json');
    const run = async () => {
        await tools.report();
        const configData = JSON.parse(await readFile(configFile, 'utf8'));
        const config = new Config(base, configData.sites);
        await config.validate();
        await config.execute();
        if (config.error) {
            throw new Error('Error occurred during backup.');
        }
    };
    run().catch(async (err) => {
        await log.error(err);
        process.exit(1);
    });
}
